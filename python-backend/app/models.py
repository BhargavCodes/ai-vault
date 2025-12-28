# app/models.py
from app import db
from datetime import datetime, timezone
from typing import Optional, Any


# ========================================================
## 👤 User Model
# ========================================================
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    
    # 1. New Identity Fields
    email = db.Column(db.String(120), unique=True, nullable=False)  # <--- Login ID
    full_name = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.Date, nullable=True)
    
    # 2. Security Fields
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default="user")
    
    # 3. OTP Fields (For Forgot Password)
    reset_otp = db.Column(db.String(6), nullable=True)
    reset_otp_expiry = db.Column(db.DateTime, nullable=True)

    # 4. Profile
    profile_picture = db.Column(db.String(500), nullable=True)

    def __init__(self, email, password, full_name, dob=None, role="user"):
        self.email = email
        self.full_name = full_name
        self.dob = dob
        self.role = role
        self.set_password(password) # Hash immediately on creation

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "dob": self.dob.isoformat() if self.dob else None,
            "role": self.role,
            "profile_picture": self.profile_picture
        }


# --------------------------------------------------------
## 📜 Activity Log Model
# --------------------------------------------------------
class ActivityLog(db.Model):
    """Logs user actions and system events."""
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(200), nullable=False)
    route = db.Column(db.String(200), nullable=False)
    # Timestamp defaults to the current time in UTC
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __init__(self, user_id: int, action: str, route: str = "/unknown",
                 timestamp: Optional[datetime] = None):
        self.user_id = user_id
        self.action = action
        self.route = route
        self.timestamp = timestamp or datetime.now(timezone.utc)

    def to_dict(self) -> dict[str, Any]:
        """Returns a dictionary representation, formatting the timestamp."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "route": self.route,
            "timestamp": self.timestamp.isoformat()
        }


# --------------------------------------------------------
## 📁 Uploaded File Model
# --------------------------------------------------------
class UploadedFile(db.Model):
    """Stores metadata for files uploaded by users."""
    __tablename__ = "uploaded_files"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    # URL to access the stored file (e.g., Cloudinary, S3 link)
    url = db.Column(db.String(1000), nullable=False)
    file_type = db.Column(db.String(100), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # ✅ AI Fields (You already had these, keep them!)
    summary = db.Column(db.Text, nullable=True)
    ocr_text = db.Column(db.Text, nullable=True)
    ai_tags = db.Column(db.String(500), nullable=True) # Store as comma-separated string
    vision_analysis = db.Column(db.Text, nullable=True)
    is_analyzed = db.Column(db.Boolean, default=False)

    def __init__(self, user_id: int, filename: str, url: str, file_type: str):
        self.user_id = user_id
        self.filename = filename
        self.url = url
        self.file_type = file_type

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "url": self.url,
            "file_type": self.file_type,
            "uploaded_at": self.uploaded_at.isoformat(),
            
            # THESE ARE THE IMPORTANT NEW LINES:
            "summary": self.summary,
            "ocr_text": self.ocr_text,
            "ai_tags": self.ai_tags,
            "vision_analysis": self.vision_analysis,
            "is_analyzed": self.is_analyzed
        }