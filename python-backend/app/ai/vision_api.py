# app/ai/vision_api.py
import google.generativeai as genai
import os
import time

# Configure the Gemini API client
genai.configure(api_key=os.getenv("GEMINI_API_KEY")) 

def analyze_file_bytes(bytes_data: bytes, mime_type: str) -> str:
    """
    For Images: Sends raw bytes directly to Gemini.
    """
    # Use the model you confirmed works (gemini-2.5-flash)
    model = genai.GenerativeModel("gemini-2.5-flash") 
    prompt = "Explain this image briefly and extract tags/keywords."
    
    try:
        response = model.generate_content([
            {"mime_type": mime_type, "data": bytes_data},
            prompt
        ])
        return response.text
    except Exception as e:
        print(f"Gemini Vision API error: {e}")
        return f"Error: {str(e)}"


def analyze_via_upload(file_path: str, mime_type: str) -> str:
    """
    For PDFs/Docs: Uploads file to Gemini's temp storage first.
    """
    print(f"DEBUG: Uploading {mime_type} to Gemini File API...")
    try:
        # 1. Upload to Google
        uploaded_file = genai.upload_file(file_path, mime_type=mime_type)
        print(f"DEBUG: File uploaded: {uploaded_file.name}")
        
        # 2. Wait for processing
        while uploaded_file.state.name == "PROCESSING":
            print("DEBUG: Waiting for Gemini to process file...")
            time.sleep(1)
            uploaded_file = genai.get_file(uploaded_file.name)

        if uploaded_file.state.name == "FAILED":
             return "Error: Gemini failed to process this file."

        # 3. Generate Content
        model = genai.GenerativeModel("gemini-2.5-flash") 
        prompt = "Summarize this document in detail. Extract key points and 3-5 tags."
        
        response = model.generate_content([uploaded_file, prompt])
        
        return response.text
        
    except Exception as e:
        print(f"Gemini Upload API error: {e}")
        return f"Error analyzing document: {str(e)}"