# app/__init__.py
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from .config import Config
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from typing import List, cast
from flask_cors import CORS 
from flask_mail import Mail

# --- Global Initialization ---
db = SQLAlchemy()
limiter = None
mail = Mail()

# --- Key Function for Rate Limiting ---
def get_rate_limit_key():
    """
    Determines the key used for rate limiting.
    Prioritizes the authenticated user ID from a Bearer token; 
    falls back to the remote IP address if no valid token is present.
    """
    from flask import request
    from app.auth.utils import verify_token

    # 1. Get Authorization Header safely
    auth_header = request.headers.get("Authorization", "")

    # 2. ONLY attempt verification if it looks like a valid Bearer token
    # This fixes the "TOKEN ERROR: Not enough segments" log spam
    if auth_header and auth_header.startswith("Bearer "):
        token_parts = auth_header.split(" ", 1)
        if len(token_parts) == 2:
            token = token_parts[1]
            try:
                user_id = verify_token(token)
                if user_id:
                    return f"user:{user_id}"
            except:
                pass

    # Default to IP address if no valid token found
    return get_remote_address()


# --- Application Factory Function ---
def create_app():
    """
    Factory function to create and configure the Flask application.
    """
    app = Flask(__name__)
    CORS(app) # Enable Cross-Origin Resource Sharing
    
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    mail.init_app(app)

    # Rate limiting (Limiter)
    global limiter
    limiter = Limiter(
        key_func=get_rate_limit_key,
        default_limits=cast(List[str], [app.config.get("RATELIMIT_DEFAULT")]), 
        headers_enabled=app.config.get("RATELIMIT_HEADERS_ENABLED", True),
        storage_uri=app.config.get("RATELIMIT_STORAGE_URL", None)
    )
    limiter.init_app(app)

    # Register Blueprints (Routes)
    
    from .routes import routes
    app.register_blueprint(routes)

    from .auth import auth as auth_bp
    app.register_blueprint(auth_bp, url_prefix="/auth")

    from .routes_files import routes_files
    app.register_blueprint(routes_files, url_prefix="/files")

    from .ai.routes_ai import routes_ai
    app.register_blueprint(routes_ai, url_prefix="/ai")

    # Create database tables within the application context
    with app.app_context():
        db.create_all()

    return app