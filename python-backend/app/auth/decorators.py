# app/auth/decorators.py
from functools import wraps
from flask import request
from app.auth.auth_helpers import get_current_user_id


def require_auth(func):
    """
    Ensures the user is authenticated.
    
    If valid, injects user_id into the route:
    
        @require_auth
        def route(user_id):
            ...
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        user_id = get_current_user_id()

        if not user_id:
            return {"error": "Unauthorized"}, 401

        return func(user_id, *args, **kwargs)

    return wrapper
