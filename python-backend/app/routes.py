# app/routes.py
from flask import Blueprint, request
from app import db
from app.auth.decorators import require_auth
from app.auth.role_required import require_role
from app.utils.activity_logger import log_activity

routes = Blueprint("routes", __name__)

@routes.route("/")
def home():
    return {"message": "Welcome to your first backend API!"}


# -------------------------
# PROTECTED ROUTES
# -------------------------

@routes.route("/users")
@require_role("admin")
def get_users(user_id):
    """
    Admin: View all users (paginated)
    """
    from .models import User

    # Log admin activity
    log_activity(user_id, "Fetched all users", request.path)

    # Pagination
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    offset = (page - 1) * limit

    total_users = User.query.count()
    total_pages = (total_users + limit - 1) // limit

    users = User.query.offset(offset).limit(limit).all()

    return {
        "page": page,
        "limit": limit,
        "total_users": total_users,
        "total_pages": total_pages,
        "users": [u.to_dict() for u in users],
    }


@routes.route("/users/<int:user_id_param>")
@require_auth
def get_user(user_id, user_id_param):
    """
    View a single user
    """
    from .models import User
    log_activity(user_id, f"Viewed user {user_id_param}", request.path)

    user = User.query.get(user_id_param)
    if not user:
        return {"error": "User not found"}, 404

    return user.to_dict()


@routes.route("/users/<int:user_id_param>", methods=["PUT"])
@require_auth
def update_user(user_id, user_id_param):
    """
    Update a user (self or admin editing)
    """
    from .models import User

    user = User.query.get(user_id_param)
    if not user:
        return {"error": "User not found"}, 404

    data = request.get_json()
    user.name = data.get("name", user.name)
    user.age = data.get("age", user.age)

    db.session.commit()

    log_activity(user_id, f"Updated user {user_id_param}", request.path)

    return {"message": "User updated", "user": user.to_dict()}


@routes.route("/users/<int:user_id_param>", methods=["DELETE"])
@require_role("admin")
def delete_user(user_id, user_id_param):
    """
    Admin: Delete a user
    """
    from .models import User

    user = User.query.get(user_id_param)
    if not user:
        return {"error": "User not found"}, 404

    db.session.delete(user)
    db.session.commit()

    log_activity(user_id, f"Deleted user {user_id_param}", request.path)

    return {"message": "User deleted", "id": user_id_param}


@routes.route("/users/search")
@require_auth
def search_users(user_id):
    """
    Search users by name (public)
    """
    from .models import User

    name_query = request.args.get("name", "").strip()
    if not name_query:
        return {"error": "Missing 'name' query parameter"}, 400

    results = User.query.filter(User.name.ilike(f"%{name_query}%")).all()  #type: ignore

    log_activity(user_id, f"Searched users: {name_query}", request.path)

    return {
        "query": name_query,
        "results_count": len(results),
        "results": [u.to_dict() for u in results]
    }

@routes.route("/upload", methods=["POST"])
@require_auth
def upload_file(user_id):
    """
    Upload any file (PDF, JPG, PNG, ZIP, DOCX, etc.)
    """
    from app.storage.storage_loader import get_storage

    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files["file"]

    storage = get_storage()
    url = storage.upload_file(file, folder="files")

    # Log activity
    log_activity(user_id, f"Uploaded file {file.filename}", request.path)

    return {"message": "File uploaded", "url": url}
