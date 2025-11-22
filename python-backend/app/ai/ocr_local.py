import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def extract_text(image_path: str) -> str:
    """
    Uses Gemini Flash for OCR instead of Tesseract (saves RAM & setup).
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        myfile = genai.upload_file(image_path)
        
        response = model.generate_content([
            myfile,
            "Extract all readable text from this image strictly. Return only the text."
        ])
        
        return response.text.strip()
    except Exception as e:
        print(f"Gemini OCR Error: {e}")
        return ""