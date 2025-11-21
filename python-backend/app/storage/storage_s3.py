# app/storage/storage_s3.py
import os
import boto3
from botocore.exceptions import ClientError
from flask import current_app
from werkzeug.utils import secure_filename
from urllib.parse import urljoin

class S3Storage:
    """
    S3 storage. Expects these config values:
     - AWS_S3_BUCKET_NAME
     - AWS_ACCESS_KEY_ID
     - AWS_SECRET_ACCESS_KEY
     - AWS_REGION (optional)
    """

    def __init__(self):
        self.bucket = current_app.config.get("AWS_S3_BUCKET_NAME")
        self.region = current_app.config.get("AWS_REGION", "")
        self._client = boto3.client(
            "s3",
            aws_access_key_id=current_app.config.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=current_app.config.get("AWS_SECRET_ACCESS_KEY"),
            region_name=self.region or None
        )

    def _upload_bytes(self, file_obj, key, ExtraArgs=None):
        try:
            # file_obj is a FileStorage; use file_obj.stream or .read()
            content = file_obj.read()
            self._client.put_object(Bucket=self.bucket, Key=key, Body=content, **(ExtraArgs or {}))
            # Construct URL (public object assumed)
            if self.region:
                return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{key}"
            return f"https://{self.bucket}.s3.amazonaws.com/{key}"
        except ClientError:
            return None

    def upload_file(self, file, folder="uploads"):
        filename = secure_filename(file.filename)
        key = f"{folder}/{filename}"
        url = self._upload_bytes(file, key, ExtraArgs={"ACL": "public-read"})
        return url

    def upload_profile_picture(self, file, user_id):
        filename = secure_filename(file.filename)
        key = f"profile_pictures/{user_id}/user_{user_id}_profile"
        url = self._upload_bytes(file, key, ExtraArgs={"ACL": "public-read", "ContentType": file.mimetype})
        return url

    def delete_file(self, url_or_key):
        # If full url passed, extract key after bucket host
        key = url_or_key
        if url_or_key.startswith("http"):
            # naive parse: everything after bucket/...
            parts = url_or_key.split(f"/{self.bucket}/")
            if len(parts) == 2:
                key = parts[1]
            else:
                # fallback: remove scheme+host
                key = "/".join(url_or_key.split("/")[3:])
        try:
            self._client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False
