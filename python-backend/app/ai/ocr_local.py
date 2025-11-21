# app/ai/ocr_local.py
import pytesseract
from PIL import Image


def extract_text(path: str) -> str:
    """
    Extract text from image.
    Returns empty string on OCR failure (safe fallback).
    """
    try:
        img = Image.open(path)
        return pytesseract.image_to_string(img) or ""
    except Exception:
        return ""
