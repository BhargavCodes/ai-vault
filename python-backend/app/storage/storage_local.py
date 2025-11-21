# app/storage/storage_local.py
import os
from flask import current_app, url_for
from werkzeug.utils import secure_filename
from pathlib import Path

class LocalStorage:
    """
    Saves uploads to a server-side folder (e.g. instance/uploads) and returns a local URL.
    Intended for development only.
    """

    def __init__(self):
        # base folder inside your project (instance/uploads or app/uploads)
        base = current_app.config.get("LOCAL_UPLOAD_PATH")
        if not base:
            # default to project-root/uploads
            base = os.path.join(current_app.root_path, "..", "uploads")
        self.upload_root = os.path.abspath(base)
        Path(self.upload_root).mkdir(parents=True, exist_ok=True)

    def _save_file(self, file_obj, dest_folder):
        filename = secure_filename(file_obj.filename)
        folder = os.path.join(self.upload_root, dest_folder)
        Path(folder).mkdir(parents=True, exist_ok=True)
        dest_path = os.path.join(folder, filename)
        file_obj.save(dest_path)
        # return file path (not a remote url) — you can adjust to serve static files
        return dest_path

    def upload_file(self, file, folder="files"):
        path = self._save_file(file, folder)
        # return a file:// path so callers can see it; in dev you may want to serve with flask send_from_directory
        return f"file://{path}"

    def upload_profile_picture(self, file, user_id):
        # keep profile pictures in profile_pics/{user_id}/ and use a standard filename
        filename = secure_filename(file.filename)
        folder = f"profile_pics/{user_id}"
        saved = self._save_file(file, folder)
        return f"file://{saved}"

    def delete_file(self, url_or_path):
        # Accept either file://path or absolute path.
        if url_or_path.startswith("file://"):
            path = url_or_path[len("file://"):]
        else:
            path = url_or_path
        try:
            os.remove(path)
            return True
        except FileNotFoundError:
            return False
        except Exception:
            return False
