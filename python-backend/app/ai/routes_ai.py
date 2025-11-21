# app/ai/routes_ai.py
import os
from flask import Blueprint, request, jsonify
from app.auth.decorators import require_auth
from app.utils.activity_logger import log_activity
from .ai_utils import save_temp_file, guess_file_type, is_image, os
from .classify_local import classify_image
from .ocr_local import extract_text
from .summarize_api import summarize_text
from .vision_api import analyze_file_bytes
from typing import Any, Dict, Optional

routes_ai = Blueprint("routes_ai", __name__)

# --------------------------------------------------------
## 🤖 AI Analysis Endpoint
# --------------------------------------------------------

@routes_ai.route("/analyze", methods=["POST"])
@require_auth
def analyze_file(user_id: int):
    """
    Analyzes an uploaded file using a combination of local ML tools (classification, OCR) 
    and the Gemini API (multimodal analysis, summarization).
    """
    if "file" not in request.files:
        return jsonify({"error": "No file given"}), 400
    
    file = request.files["file"]
    filename = file.filename or ""
    file_type = guess_file_type(filename)

    results: Dict[str, Any] = {
        "file_type": file_type,
        "filename": filename
    }
    temp_path: Optional[str] = None
    
    try:
        # 1. Save file locally for local ML processing (classification/OCR)
        temp_path = save_temp_file(file)

        # 2. Local Image Processing (Only if it's an image)
        if is_image(file_type):
            results["classification"] = classify_image(temp_path)
            results["ocr_text"] = extract_text(temp_path)

        # 3. Multimodal Analysis (Gemini Vision API)
        # We need the raw bytes, so rewind the file stream, read, and then seek to 0 again
        file.seek(0)
        bytes_data = file.read()
        
        results["vision_ai"] = analyze_file_bytes(
            bytes_data=bytes_data,
            mime_type=file_type
        )
        file.seek(0) # Rewind again in case file is processed elsewhere later
        
        # 4. Summarization (If OCR or Vision extracted text)
        ocr_text = results.get("ocr_text", "")
        if ocr_text:
            results["summary"] = summarize_text(ocr_text)

        # Log and return success
        log_activity(user_id, f"AI analyzed file {filename}", "/ai/analyze")
        return jsonify({"analysis": results})

    except Exception as e:
        # Catch any critical failure during processing
        print(f"Critical error during AI analysis: {e}")
        return jsonify({"error": f"An unexpected error occurred during processing: {e}"}), 500

    finally:
        # 5. Cleanup: Delete the temporary file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)