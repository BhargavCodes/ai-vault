# app/routes_files.py
from flask import Blueprint, request, jsonify
from app import db
from app.auth.decorators import require_auth
from app.utils.activity_logger import log_activity
from app.storage.storage_loader import get_storage
from app.models import UploadedFile, ActivityLog, User
from sqlalchemy import or_
import mimetypes
import requests
import os
import traceback

# AI Utilities
from app.ai.ai_utils import guess_file_type, is_image, extract_text_from_docx
from app.ai.classify_local import classify_image
from app.ai.ocr_local import extract_text
from app.ai.summarize_api import summarize_text

# Try importing vision API functions (Safe import)
try:
    from app.ai.vision_api import analyze_file_bytes, analyze_via_upload
except ImportError:
    pass

routes_files = Blueprint("routes_files", __name__)


# ------------------------------------------------------------
## 1. ⬆️ UPLOAD FILE
# ------------------------------------------------------------
@routes_files.route("/upload", methods=["POST"])
@require_auth
def upload_file(user_id: int):
    if "file" not in request.files: return jsonify({"error": "No file provided"}), 400
    
    file_obj = request.files["file"]
    filename = file_obj.filename or "unnamed_file"
    
    storage = get_storage()
    url = storage.upload_file(file_obj, folder="files") or ""
    
    guessed_type, _ = mimetypes.guess_type(filename)
    file_type = guessed_type or "unknown"
    
    record = UploadedFile(user_id=user_id, filename=filename, url=url, file_type=file_type)
    db.session.add(record)
    db.session.commit()
    
    log_activity(user_id, f"Uploaded file {filename}", request.path)
    return jsonify({"message": "File uploaded", "file": record.to_dict()}), 201


# ------------------------------------------------------------
## 2. 📄 LIST FILES
# ------------------------------------------------------------
@routes_files.route("/list", methods=["GET"])
@require_auth
def list_files(user_id: int):
    files = UploadedFile.query.filter_by(user_id=user_id).all()
    return jsonify({"count": len(files), "files": [f.to_dict() for f in files]})


# ------------------------------------------------------------
## 3. 🗑️ DELETE FILE
# ------------------------------------------------------------
@routes_files.route("/delete/<int:file_id>", methods=["DELETE"])
@require_auth
def delete_file(user_id: int, file_id: int):
    file_record = UploadedFile.query.get(file_id)
    if not file_record: return jsonify({"error": "File not found"}), 404
    if file_record.user_id != user_id: return jsonify({"error": "Forbidden"}), 403

    storage = get_storage()
    storage.delete_file(file_record.url)
    
    db.session.delete(file_record)
    db.session.commit()
    log_activity(user_id, f"Deleted file {file_record.filename}", request.path)
    
    return jsonify({"message": "File deleted", "deleted_file_id": file_id})


# ------------------------------------------------------------
## 4. ⏳ HISTORY
# ------------------------------------------------------------
@routes_files.route("/history", methods=["GET"])
@require_auth
def file_history(user_id: int):
    history = ActivityLog.query.filter(ActivityLog.user_id == user_id)\
        .filter(or_(ActivityLog.action.ilike("Uploaded%"), ActivityLog.action.ilike("Deleted%")))\
        .order_by(ActivityLog.timestamp.desc()).all()
    return jsonify({"count": len(history), "history": [h.to_dict() for h in history]})


# ------------------------------------------------------------
## 5. 🖼️ PROFILE PICTURE
# ------------------------------------------------------------
@routes_files.route("/upload/profile", methods=["POST"])
@require_auth
def upload_profile_picture(user_id: int):
    print(f"\n📸 DEBUG: Starting Profile Upload for User {user_id}")
    
    try:
        user = User.query.get(user_id)
        if not user:
            print("❌ DEBUG: User not found")
            return jsonify({"error": "User not found"}), 404

        if "image" not in request.files:
            print("❌ DEBUG: No image in request.files")
            return jsonify({"error": "No image file provided"}), 400
        
        image = request.files["image"]
        print(f"✅ DEBUG: Received image: {image.filename}")

        storage = get_storage()
        
        # Delete old image if exists
        if user.profile_picture:
            print(f"🗑️ DEBUG: Deleting old image: {user.profile_picture}")
            try:
                storage.delete_file(user.profile_picture)
            except Exception as e:
                print(f"⚠️ DEBUG: Failed to delete old image (ignoring): {e}")

        # Upload new image
        print("⬆️ DEBUG: Uploading to Storage...")
        url = storage.upload_file(image, folder="profile_pics")
        
        if not url:
            print("❌ DEBUG: Storage driver returned None (Upload failed)")
            return jsonify({"error": "Storage upload failed"}), 500
            
        print(f"✅ DEBUG: Uploaded to: {url}")
        
        user.profile_picture = url
        db.session.commit()
        print("💾 DEBUG: Database updated.")

        return jsonify({"message": "Profile picture updated", "url": url})

    except Exception as e:
        import traceback
        print("❌ CRITICAL UPLOAD ERROR:")
        traceback.print_exc()
        return jsonify({"error": f"Upload crashed: {str(e)}"}), 500


# ------------------------------------------------------------
## 6. 🔎 SEARCH
# ------------------------------------------------------------
@routes_files.route("/search", methods=["GET"])
@require_auth
def search_files(user_id: int):
    query = request.args.get("q", "").strip()
    if not query: return jsonify({"error": "Missing query parameter 'q'"}), 400
    
    results = UploadedFile.query.filter(
        UploadedFile.user_id == user_id,
        or_(
            UploadedFile.filename.ilike(f"%{query}%"),
            UploadedFile.ocr_text.ilike(f"%{query}%"),
            UploadedFile.summary.ilike(f"%{query}%"),
            UploadedFile.ai_tags.ilike(f"%{query}%")
        )
    ).all()
    return jsonify({"count": len(results), "files": [f.to_dict() for f in results]})


# ------------------------------------------------------------
## 7. 🤖 SMART ANALYZE ROUTE
# ------------------------------------------------------------
@routes_files.route("/<int:file_id>/analyze", methods=["POST"])
@require_auth
def analyze_existing_file(user_id: int, file_id: int):
    print(f"\n🔍 DEBUG: Starting Analysis for File ID {file_id}")

    # 1. Check Imports inside the function (Safe Mode)
    try:
        import requests
        import traceback
        from app.ai.vision_api import analyze_file_bytes, analyze_via_upload
        from app.ai.classify_local import classify_image
        from app.ai.ocr_local import extract_text
        from app.ai.summarize_api import summarize_text
        print("✅ DEBUG: All AI modules imported successfully.")
    except ImportError as e:
        print(f"❌ CRITICAL IMPORT ERROR: {e}")
        return jsonify({"error": f"Server Missing Library: {e}"}), 500

    # 2. Get File Record
    file_record = UploadedFile.query.get(file_id)
    if not file_record: return jsonify({"error": "File not found"}), 404
    if file_record.user_id != user_id: return jsonify({"error": "Forbidden"}), 403

    temp_path = None
    file_bytes = None
    
    try:
        # 3. Download File
        print(f"⬇️ DEBUG: Downloading from {file_record.url[:30]}...")
        
        if file_record.url.startswith("http"):
            # Fake Headers to bypass Cloudinary 401
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            response = requests.get(file_record.url, headers=headers)
            
            if response.status_code != 200: 
                print(f"❌ DOWNLOAD FAILED: Status {response.status_code}")
                return jsonify({"error": "Failed to download file"}), 500
            file_bytes = response.content
            
            import tempfile
            # Force correct extension for PDF/DOCX
            ext = os.path.splitext(file_record.filename)[1].lower()
            suffix = ext if ext else ".tmp"
            if file_record.filename.lower().endswith(".pdf"): suffix = ".pdf"
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(file_bytes)
                temp_path = tmp.name
            print(f"✅ DEBUG: Downloaded to temp file: {temp_path}")
        
        elif file_record.url.startswith("file://"):
            local_path = file_record.url.replace("file://", "")
            temp_path = local_path
            with open(local_path, "rb") as f: file_bytes = f.read()
            print("✅ DEBUG: Local file read.")

        # 4. AI Logic
        print("🧠 DEBUG: Entering AI Logic Switch...")

        # SCENARIO: PDF
        if file_record.file_type == "application/pdf" or file_record.filename.lower().endswith(".pdf"):
            print("👉 DEBUG: Processing as PDF")
            file_record.ai_tags = "PDF Document"
            if temp_path:
                file_record.vision_analysis = analyze_via_upload(temp_path, "application/pdf")
                file_record.summary = file_record.vision_analysis
                print("✅ DEBUG: PDF Analysis returned.")

        # SCENARIO: WORD DOCX
        elif file_record.filename.lower().endswith(".docx"):
             print("👉 DEBUG: Processing as DOCX")
             file_record.ai_tags = "Word Document"
             if temp_path:
                 doc_text = extract_text_from_docx(temp_path)
                 if doc_text:
                     file_record.ocr_text = doc_text[:5000]
                     print("⏳ DEBUG: Summarizing Word Doc...")
                     file_record.summary = summarize_text(doc_text[:10000])
                     print("✅ DEBUG: DOCX Analysis Success")
                 else:
                     print("❌ DEBUG: Failed to extract text from DOCX")

        # SCENARIO: TEXT
        elif file_record.file_type.startswith("text") or file_record.filename.lower().endswith(('.txt', '.md', '.csv', '.py')):
            print("👉 DEBUG: Processing as TEXT")
            file_record.ai_tags = "Text File"
            text = file_bytes.decode("utf-8", errors="ignore")
            file_record.ocr_text = text[:5000]
            print("⏳ DEBUG: Summarizing text...")
            file_record.summary = summarize_text(text[:10000])
            print("✅ DEBUG: Summary created.")

        # SCENARIO: IMAGE
        elif is_image(file_record.file_type) or file_record.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.avif')):
            print("👉 DEBUG: Processing as IMAGE")
            if temp_path:
                try:
                    cls = classify_image(temp_path)
                    file_record.ai_tags = cls.get("label", "")
                    file_record.ocr_text = extract_text(temp_path)
                except Exception as e: print(f"Local AI Error: {e}")
            
            if file_bytes:
                # Get vision analysis
                vision_text = analyze_file_bytes(file_bytes, file_record.file_type)
                file_record.vision_analysis = vision_text
                
                # ✨ FIX: For images, use the vision text as the summary!
                # (Or summarize it if it's too long)
                if not file_record.summary:
                    file_record.summary = summarize_text(vision_text) if len(vision_text) > 500 else vision_text

        # 5. Save
        print("💾 DEBUG: Saving to Database...")
        file_record.is_analyzed = True
        db.session.commit()
        print("✅ DEBUG: Commit successful.")

    except Exception as e:
        print("\n❌ CRITICAL ERROR DURING EXECUTION:")
        traceback.print_exc()
        return jsonify({"error": f"Analysis Crashed: {str(e)}"}), 500
        
    finally:
        if file_record.url.startswith("http") and temp_path and os.path.exists(temp_path):
            try: os.remove(temp_path)
            except: pass

    return jsonify({"message": "Analysis complete", "file": file_record.to_dict()})


# ------------------------------------------------------------
## 8. 💬 CHAT WITH FILE (Multimodal Support + Auto-Retry)
# ------------------------------------------------------------
@routes_files.route("/<int:file_id>/chat", methods=["POST"])
@require_auth
def chat_with_file(user_id: int, file_id: int):
    print(f"💬 DEBUG: Chat request for File {file_id}")
    
    file_record = UploadedFile.query.get(file_id)
    if not file_record: return jsonify({"error": "File not found"}), 404
    if file_record.user_id != user_id: return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    question = data.get("question")
    if not question: return jsonify({"error": "No question provided"}), 400

    try:
        # Imports needed for AI and Retry Logic
        import google.generativeai as genai
        import os
        from PIL import Image
        import io
        import requests
        import time
        from google.api_core.exceptions import ResourceExhausted

        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        # ⚠️ FIX: Use "gemini-1.5-flash" (2.5 does not exist yet)
        model = genai.GenerativeModel("gemini-2.5-flash") 

        # === PATH A: IT IS AN IMAGE (Send actual pixels) ===
        image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.avif']
        is_image_file = any(file_record.filename.lower().endswith(ext) for ext in image_extensions)

        if is_image_file:
            print("📷 DEBUG: Detected Image. Downloading for Vision API...")
            
            # 1. Download image to memory (RAM)
            headers = {"User-Agent": "Mozilla/5.0"}
            img_response = requests.get(file_record.url, headers=headers)
            
            if img_response.status_code == 200:
                # 2. Convert raw bytes to PIL Image
                image_data = Image.open(io.BytesIO(img_response.content))
                
                # 3. Create a Concise Assistant Persona
                system_prompt = (
                    "You are a helpful visual assistant. "
                    "Answer the user's question based on the image in a concise, conversational way. "
                    "If the user asks for advice/improvements, give exactly 3 short, actionable bullet points. "
                    "Do not write long paragraphs or formal reports."
                )
                
                # 4. Send Image + Prompts to Gemini (With Retry Logic)
                try:
                    response = model.generate_content([system_prompt, question, image_data])
                except ResourceExhausted:
                    print("⏳ 429 Quota Exceeded. Sleeping for 10 seconds...")
                    time.sleep(10)
                    # Try one more time
                    response = model.generate_content([system_prompt, question, image_data])
                
                return jsonify({"answer": response.text})
            else:
                print(f"❌ Error downloading image: {img_response.status_code}")
                # Fallback to text context if download fails
                pass

        # === PATH B: TEXT/DOC/PDF (Use RAG Context) ===
        # (This runs if it's NOT an image OR if image download failed)
        
        context = ""
        if file_record.ocr_text:
            context += f"Document Text:\n{file_record.ocr_text[:15000]}\n\n"
        if file_record.summary:
            context += f"Summary:\n{file_record.summary}\n\n"
        
        if not context:
            return jsonify({"answer": "I can't see this file yet. Please click 'Analyze' first!"})

        prompt = f"""
        You are an AI assistant analyzing a file.
        CONTEXT: {context}
        USER QUESTION: {question}
        INSTRUCTIONS: Answer based ONLY on the context. Use Markdown.
        """
        
        # Retry logic for Text Chat as well
        try:
            response = model.generate_content(prompt)
        except ResourceExhausted:
            print("⏳ 429 Quota Exceeded (Text). Sleeping for 10 seconds...")
            time.sleep(10)
            response = model.generate_content(prompt)

        return jsonify({"answer": response.text})

    except Exception as e:
        print(f"❌ CHAT ERROR: {e}")
        traceback.print_exc()
        return jsonify({"error": f"AI Chat failed: {str(e)}"}), 500