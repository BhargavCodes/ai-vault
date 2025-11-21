# app/storage/storage_loader.py
from flask import current_app
from .storage_local import LocalStorage
from .storage_cloudinary import CloudinaryStorage
from .storage_s3 import S3Storage


def get_storage():
    """
    Returns the active storage driver (local, cloudinary, or s3)
    based on STORAGE_DRIVER in config.
    """

    driver = current_app.config.get("STORAGE_DRIVER", "cloudinary").lower()

    if driver == "local":
        return LocalStorage()

    if driver == "s3":
        return S3Storage()

    # default
    return CloudinaryStorage()
