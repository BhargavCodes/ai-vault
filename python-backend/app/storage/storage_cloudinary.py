# app/storage/storage_cloudinary.py
import cloudinary
import cloudinary.uploader
from flask import current_app

class CloudinaryStorage:
    """
    Cloudinary storage. Requires config in app.config:
      - CLOUDINARY_CLOUD_NAME
      - CLOUDINARY_API_KEY
      - CLOUDINARY_API_SECRET
    """

    def __init__(self):
        cloudinary.config(
            cloud_name=current_app.config.get("CLOUDINARY_CLOUD_NAME", ""),
            api_key=current_app.config.get("CLOUDINARY_API_KEY", ""),
            api_secret=current_app.config.get("CLOUDINARY_API_SECRET", ""),
            secure=True
        )

    def upload_file(self, file, folder="uploads"):
        """
        Upload any file. resource_type='auto' lets cloudinary handle images/documents.
        `file` can be FileStorage (Flask) or a local path.
        """
        upload_result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="auto"
        )
        return upload_result.get("secure_url")

    def upload_profile_picture(self, file, user_id):
        """
        Upload/overwrite a profile image for the user.
        Uses a deterministic public_id so repeated uploads overwrite previous image.
        """
        public_id = f"user_{user_id}_profile"
        upload_result = cloudinary.uploader.upload(
            file,
            folder=f"profile_pictures/{user_id}",
            resource_type="image",
            public_id=public_id,
            overwrite=True
        )
        return upload_result.get("secure_url")

    def delete_file(self, url_or_identifier):
        """
        Try to extract public_id from the URL; otherwise accept a public_id arg.
        Return True on success.
        """
        try:
            if url_or_identifier.startswith("http"):
                # extract public id: Cloudinary URLs often end with /v<version>/<folder>/<public_id>.<ext>
                # We'll be conservative: split on '/' and take last segment then remove extension.
                last = url_or_identifier.rstrip("/").split("/")[-1]
                public_id = ".".join(last.split(".")[:-1])  # remove extension
            else:
                public_id = url_or_identifier
            # If public_id contains folder like profile_pictures/1/user_1_profile, use as-is
            cloudinary.uploader.destroy(public_id, invalidate=True)
            return True
        except Exception:
            return False
