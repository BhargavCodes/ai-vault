from flask import request, jsonify
from . import auth
from .role_required import require_role
from app.utils.activity_logger import log_activity
from app import limiter  # Global rate limiter instance
from datetime import datetime

# Import the email sender
from app.auth.utils import send_reset_email

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
## 1. 📝 SIGNUP (Updated for Identity)
# --------------------------------------------------------
@auth.route("/signup", methods=["POST"])
def signup():
    """Registers a new user with Email, Full Name, and DOB."""
    from app import db
    from ..models import User

    data = request.get_json() or {}

    # 1. Extract New Fields
    email = data.get("email")
    full_name = data.get("full_name")
    dob_str = data.get("dob")
    password = data.get("password")
    role = data.get("role", "user")

    # 2. Validate Required Fields
    if not all([email, full_name, password]):
        return jsonify({"error": "Missing required fields (email, full_name, password)"}), 400

    # 3. Check for Duplicate Email
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    # 4. Handle Date of Birth Parsing
    dob_date = None
    if dob_str:
        try:
            dob_date = datetime.strptime(dob_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid DOB format. Use YYYY-MM-DD"}), 400

    # 5. Create User
    new_user = User(
        email=email,
        password=password, 
        full_name=full_name,
        dob=dob_date,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    # Log activity
    log_activity(new_user.id, "User signed up", route="/auth/signup")

    return jsonify({"message": "Signup successful", "user": new_user.to_dict()}), 201


# --------------------------------------------------------
## 2. 🔑 LOGIN (Updated for Email)
# --------------------------------------------------------
@auth.route("/login", methods=["POST"])
# Apply a rate limit to prevent brute-force attacks
@limiter.limit("10 per minute")
def login():
    """Authenticates a user via Email and issues a JWT token."""
    from ..models import User

    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
         return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()

    # Verify user exists and password is correct
    if not user or not user.check_password(password):
        # Avoid revealing if email exists for security
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_token(user.id)
    log_activity(user.id, "User logged in", route="/auth/login")

    return jsonify({
        "message": "Login Successful", 
        "token": token, 
        "user": user.to_dict()
    })


# --------------------------------------------------------
## 3. 👤 GET CURRENT USER PROFILE (ME)
# --------------------------------------------------------
@auth.route("/me", methods=["GET"])
def get_me():
    """Retrieves the profile of the authenticated user."""
    from ..models import User

    token_header = request.headers.get("Authorization")
    if not token_header:
        return jsonify({"error": "Missing token"}), 401

    # Extract clean token
    token = token_header
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]

    # Verify Token
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 401

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

    user_id = verify_token(token)
    if not user_id:
        return jsonify({"error": "Invalid or missing token"}), 401

    data = request.get_json() or {}
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not all([old_password, new_password]):
        return jsonify({"error": "Missing fields (old_password, new_password)"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404 

    if not user.check_password(old_password):
        return jsonify({"error": "Incorrect old password"}), 400

    user.set_password(new_password)
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
## 6. ❓ FORGOT PASSWORD (Using Email)
# --------------------------------------------------------
@auth.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Generates a password reset token for a user via Email."""
    from ..models import User

    data = request.get_json() or {}
    email = data.get("email")

    if not email:
        return jsonify({"error": "Missing 'email' field"}), 400

    user = User.query.filter_by(email=email).first()
    
    # Logic: If user exists, send email.
    if user:
        try:
            send_reset_email(user)
            log_activity(user.id, "Requested password reset", route="/auth/forgot-password")
        except Exception as e:
            # In production, log this error but don't show specific failure details to user
            print(f"❌ Error sending email: {e}")

    # Return same message whether user exists or not (security practice)
    return jsonify({"message": "If an account with that email exists, a reset link has been sent."}) 


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

    user.set_password(new_password)
    db.session.commit()

    log_activity(user_id, "Password reset via reset-token", route="/auth/reset-password")

    return jsonify({"message": "Password reset successful"})