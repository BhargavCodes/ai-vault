# app/ai/ai_utils.py
import mimetypes
import os
import tempfile
from typing import Optional
from werkzeug.datastructures import FileStorage


# --------------------------------------------------------
## 🔧 File Type Utilities
# --------------------------------------------------------

def guess_file_type(filename: str) -> str:
    """Guesses the MIME type of a file based on its extension."""
    type_guess, _ = mimetypes.guess_type(filename)
    return type_guess or "unknown"

def is_image(file_type: str) -> bool:
    """Checks if the MIME type indicates an image."""
    return file_type.startswith("image")

def is_pdf(file_type: str) -> bool:
    """Checks if the MIME type is application/pdf."""
    return file_type == "application/pdf"

def is_text(file_type: str) -> bool:
    """Checks if the MIME type is a generic text file."""
    return file_type.startswith("text")


# --------------------------------------------------------
## 💾 File Handling
# --------------------------------------------------------

def save_temp_file(file_obj: FileStorage) -> str:
    """
    Saves an uploaded werkzeug FileStorage object to a temporary path on the 
    local filesystem, preserving the original file extension.

    Returns:
        str: The absolute path to the temporary file.
    """
    
    # Extract the file extension
    # file_obj.filename can be None, default to empty string
    filename = file_obj.filename or ""
    suffix = os.path.splitext(filename)[1]
    
    # Create a temporary file that will not be deleted on close
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    
    # Save the content of the uploaded file to the temporary path
    file_obj.save(temp.name)
    temp.close() # Close the file handle created by NamedTemporaryFile

    return temp.name


# app/ai/ai_utils.py (Add this to the bottom)

def extract_text_from_docx(file_path: str) -> str:
    """
    Extracts text from a .docx file using python-docx.
    """
    try:
        import docx
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return '\n'.join(full_text)
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""