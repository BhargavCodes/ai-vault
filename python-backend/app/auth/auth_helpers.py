# app/auth/auth_helpers.py
from flask import request
from typing import Optional

# NOTE: Assuming app.auth.utils is available for token verification
from app.auth.utils import verify_token


# --------------------------------------------------------
## 🔐 Authentication Helpers
# --------------------------------------------------------

def get_current_user_id() -> Optional[int]:
    """
    Reads the Authorization header, extracts the Bearer token, 
    verifies the token's signature, and returns the authenticated 
    user_id if valid; otherwise, returns None.
    """
    
    # 1. Get the Authorization header
    token_header = request.headers.get("Authorization")
    if not token_header:
        return None
    
    token = token_header
    
    # 2. Strip "Bearer " prefix if present
    if token.startswith("Bearer "):
        # Split into two parts and take the second part (the token itself)
        token = token.split(" ", 1)[1]

    # 3. Verify the token and return the user ID
    # The verify_token function is expected to return the user_id (int) 
    # or raise an exception/return None if verification fails.
    try:
        user_id = verify_token(token)
        return user_id
    except Exception:
        # Catch exceptions (e.g., JWT decode error, expired token)
        return None