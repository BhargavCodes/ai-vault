# app/storage/__init__.py
# simple convenience exports
from .storage_loader import get_storage
from .storage_local import LocalStorage
from .storage_cloudinary import CloudinaryStorage
from .storage_s3 import S3Storage

__all__ = ["get_storage", "LocalStorage", "CloudinaryStorage", "S3Storage"]
