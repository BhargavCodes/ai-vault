from functools import wraps
from flask import request
from .utils import verify_token
from ..models import User

def require_role(required_role):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):

            token = request.headers.get("Authorization")

            if not token:
                return {"error": "Missing token"}, 401

            if token.startswith("Bearer "):
                token = token.split(" ", 1)[1]

            user_id = verify_token(token)
            if not user_id:
                return {"error": "Invalid token"}, 401

            requester = User.query.get(user_id)
            if requester is None:
                return {"error": "User not found"}, 404

            # REAL ROLE CHECK
            if requester.role != required_role:
                return {"error": "Forbidden: insufficient role"}, 403

            # pass user_id to the route
            return func(user_id, *args, **kwargs)

        return wrapper
    return decorator
