# app/config.py
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """
    Base configuration class for the Flask application.
    Uses environment variables for sensitive or external settings 
    and provides sensible defaults.
    """

    # --- Core Flask and Security Settings ---
    # Used for session management and signing cookies
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

    # --- Database Settings (SQLAlchemy) ---
    # Note: Using SQLite for simplicity/default
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///users.db")
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- Cloud/File Storage Configuration ---
    
    # Cloudinary credentials (set via .env)
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

    # Storage driver setting (options: 'cloudinary', 'local', 's3')
    STORAGE_DRIVER = os.getenv("STORAGE_DRIVER", "cloudinary")
    
    # Maximum size of incoming request data (for file uploads)
    # 20 MB = 20 * 1024 * 1024 bytes
    MAX_CONTENT_LENGTH = 20 * 1024 * 1024

    # --- Rate Limiting Settings (Flask-Limiter) ---
    # Default rate limit applied to unauthenticated endpoints or users
    RATELIMIT_DEFAULT = "200 per hour"

    # 📧 EMAIL CONFIGURATION (Gmail)
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')