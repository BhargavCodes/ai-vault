# app/models.py
from app import db
from datetime import datetime, timezone
from typing import Optional, Any


# ========================================================
## 👤 User Model
# ========================================================
class User(db.Model):
    """Represents a user in the application."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    # Password stores the hashed value (length adjusted for modern hashes)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")
    
    # Profile picture URL
    profile_picture = db.Column(db.String(500), nullable=True)

    def __init__(self, name: str, age: int, password: str,
                 role: str = "user", profile_picture: Optional[str] = None):
        self.name = name
        self.age = age
        self.password = password
        self.role = role
        self.profile_picture = profile_picture

    def to_dict(self) -> dict[str, Any]:
        """Returns a dictionary representation of the user (excluding password)."""
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
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