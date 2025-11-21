# app/auth/routes.py
from flask import request, jsonify
from . import auth
from .role_required import require_role
from app.utils.activity_logger import log_activity
from app import limiter # Global rate limiter instance

# Clean centralized imports for auth utilities
from app.auth.utils import (
    create_password_reset_token,
    verify_password_reset_token,
    hash_password,
    verify_password,
    create_token,
    verify_token
)


# --------------------------------------------------------
## 1. 📝 SIGNUP (Public)
# --------------------------------------------------------
@auth.route("/signup", methods=["POST"])
def signup():
    """Registers a new user."""
    from app import db
    from ..models import User

    data = request.get_json() or {}

    name = data.get("name")
    age = data.get("age")
    password = data.get("password")
    role = data.get("role", "user")

    if not all([name, age, password]):
        return jsonify({"error": "Missing required fields (name, age, password)"}), 400

    hashed_password = hash_password(password)
    user = User(name=name, age=age, password=hashed_password, role=role)

    db.session.add(user)
    db.session.commit()

    # Log activity on successful creation
    log_activity(user.id, "User signed up", route="/auth/signup")

    return jsonify({"message": "Signup successful", "user": user.to_dict()}), 201


# --------------------------------------------------------
## 2. 🔑 LOGIN (Rate Limited)
# --------------------------------------------------------
@auth.route("/login", methods=["POST"])
# Apply a rate limit to prevent brute-force attacks
@limiter.limit("10 per minute")
def login():
    """Authenticates a user and issues a JWT token."""
    from ..models import User

    data = request.get_json() or {}
    name = data.get("name")
    password = data.get("password")

    user = User.query.filter_by(name=name).first()

    if not user:
        # Avoid giving away whether the user exists for security reasons
        return jsonify({"error": "Invalid credentials"}), 401

    if not verify_password(password, user.password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_token(user.id)
    log_activity(user.id, "User logged in", route="/auth/login")

    return jsonify({"message": "Login Successful", "token": token})


# --------------------------------------------------------
## 3. 👤 GET CURRENT USER PROFILE (ME)
# --------------------------------------------------------
# app/auth/routes.py (Partial replacement for get_me)

@auth.route("/me", methods=["GET"])
def get_me():
    """Retrieves the profile of the authenticated user."""
    from ..models import User

    token_header = request.headers.get("Authorization")
    print(f"DEBUG: Received Header: {token_header}") # <--- ADDED LOG

    if not token_header:
        return jsonify({"error": "Missing token"}), 401

    token = token_header
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    
    print(f"DEBUG: Extracted Token: {token}") # <--- ADDED LOG

    # Verify
    user_id = verify_token(token)
    print(f"DEBUG: Verified User ID: {user_id}") # <--- ADDED LOG
    
    if not user_id:
        # This matches the error you are seeing
        return jsonify({"error": "Invalid token payload"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    log_activity(user_id, "Viewed profile", route="/auth/me")
    return jsonify({"user": user.to_dict()})

# --------------------------------------------------------
## 4. 🔒 CHANGE PASSWORD (Auth Required)
# --------------------------------------------------------
@auth.route("/change-password", methods=["PUT"])
def change_password():
    """Allows an authenticated user to change their password."""
    from ..models import User
    from app import db

    token_header = request.headers.get("Authorization", "")
    token = token_header
    if token.startswith("Bearer "):
        token = token.split(" ")[1]

    # Verification and user retrieval logic
    try:
        user_id = verify_token(token)
    except Exception:
        return jsonify({"error": "Invalid or missing token"}), 401
    
    if not user_id:
        return jsonify({"error": "Invalid or missing token"}), 401

    data = request.get_json() or {}
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not all([old_password, new_password]):
        return jsonify({"error": "Missing fields (old_password, new_password)"}), 400

    user = User.query.get(user_id)
    # Redundant check as token verification implies user existence, but good for safety
    if not user:
        return jsonify({"error": "User not found"}), 404 

    if not verify_password(old_password, user.password):
        return jsonify({"error": "Incorrect old password"}), 400

    user.password = hash_password(new_password)
    db.session.commit()

    log_activity(user_id, "Changed password", route="/auth/change-password")

    return jsonify({"message": "Password updated successfully"})


# --------------------------------------------------------
## 5. 👑 ASSIGN ROLE (Admin Required)
# --------------------------------------------------------
@auth.route("/assign-role/<int:user_id_param>", methods=["PUT"])
@require_role("admin")
def assign_role(admin_user_id: int, user_id_param: int):
    """Allows an administrator to change another user's role."""
    from ..models import User
    from app import db

    data = request.get_json() or {}
    new_role = data.get("role")

    if new_role not in ["admin", "user"]:
        return jsonify({"error": f"Invalid role: {new_role}. Must be 'admin' or 'user'."}), 400

    user = User.query.get(user_id_param)
    if not user:
        return jsonify({"error": "Target user not found"}), 404

    user.role = new_role
    db.session.commit()

    log_activity(
        admin_user_id,
        f"Changed role of user {user_id_param} to {new_role}",
        route="/auth/assign-role"
    )

    return jsonify({"message": "Role updated", "user": user.to_dict()})


# --------------------------------------------------------
## 6. ❓ FORGOT PASSWORD (Token Creation)
# --------------------------------------------------------
@auth.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Generates a password reset token for a user."""
    from ..models import User

    data = request.get_json() or {}
    name = data.get("name")

    if not name:
        return jsonify({"error": "Missing 'name' field"}), 400

    user = User.query.filter_by(name=name).first()
    # Security note: Do not reveal if the user exists
    if not user:
        return jsonify({"message": "If the user exists, a reset process has been initiated."}) 

    token = create_password_reset_token(user.id)

    log_activity(user.id, "Requested password reset", route="/auth/forgot-password")

    # NOTE: In a real app, this token would be sent via email. 
    # For this environment, we return it directly.
    return jsonify({"message": "Password reset token created", "reset_token": token})


# --------------------------------------------------------
## 7. 🔄 RESET PASSWORD (Token Exchange)
# --------------------------------------------------------
@auth.route("/reset-password", methods=["POST"])
def reset_password():
    """Resets the password using a valid, non-expired reset token."""
    from ..models import User
    from app import db

    data = request.get_json() or {}

    token = data.get("token")
    new_password = data.get("new_password")

    if not all([token, new_password]):
        return jsonify({"error": "Missing fields (token, new_password)"}), 400

    try:
        user_id = verify_password_reset_token(token)
    except Exception:
        return jsonify({"error": "Invalid or expired token"}), 401
        
    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.password = hash_password(new_password)
    db.session.commit()

    log_activity(user_id, "Password reset via reset-token", route="/auth/reset-password")

    return jsonify({"message": "Password reset successful"})