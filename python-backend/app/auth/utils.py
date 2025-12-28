import jwt
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app
from typing import Optional
from flask_mail import Message
from app import mail  # Import the mail instance we created in __init__.py

# --------------------------------------------------------
## 🔐 Password Hashing Utilities
# --------------------------------------------------------

def hash_password(password: str) -> str:
    """Hashes a plaintext password using Werkzeug's secure hashing algorithm."""
    return generate_password_hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Checks a plaintext password against a stored hash."""
    return check_password_hash(hashed, password)


# --------------------------------------------------------
## 🔑 Authentication Token (JWT)
# --------------------------------------------------------

def create_token(user_id: int) -> str:
    """Creates a standard JWT for user authentication (valid for 24 hours)."""
    # print("CREATING TOKEN FOR USER:", user_id)
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token


def verify_token(token: str) -> Optional[int]:
    """Decodes and verifies a standard JWT."""
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        if "user_id" in payload:
            return payload["user_id"]
        return None
    except Exception as e:
        print("TOKEN ERROR:", e)
        return None


# --------------------------------------------------------
## 🔄 Password Reset Token (JWT)
# --------------------------------------------------------

def create_password_reset_token(user_id: int, minutes: int = 15) -> str:
    """Creates a short-lived JWT specifically for password reset purposes."""
    payload = {
        "user_id": user_id,
        "purpose": "password_reset",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=minutes)
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token


def verify_password_reset_token(token: str) -> Optional[int]:
    """Decodes and verifies a password reset JWT."""
    try:
        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
        if payload.get("purpose") != "password_reset":
            return None
        return payload.get("user_id")
    except Exception as e:
        print("RESET TOKEN ERROR:", e)
        return None


# --------------------------------------------------------
## 📧 Email Sending Utility (NEW)
# --------------------------------------------------------

def send_reset_email(user):
    """
    Generates a token and sends a password reset email to the user.
    """
    token = create_password_reset_token(user.id)
    
    # This URL points to your React Frontend (Vite runs on 5173 by default)
    # The frontend will grab the token from the URL and send it back to the API.
    reset_url = f"http://localhost:5173/reset-password?token={token}"

    msg = Message(
        subject='Password Reset Request',
        recipients=[user.email],
        sender=current_app.config.get('MAIL_DEFAULT_SENDER')
    )
                  
    msg.body = f'''To reset your password, visit the following link:
{reset_url}

This link will expire in 15 minutes.
If you did not make this request then simply ignore this email and no changes will be made.
'''

    try:
        mail.send(msg)
        print(f"✅ Email sent successfully to {user.email}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")