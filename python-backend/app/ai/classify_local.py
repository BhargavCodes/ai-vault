import google.generativeai as genai
import os

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def classify_image(image_path: str) -> dict:
    """
    Uses Gemini Flash (Cloud) instead of local PyTorch to save RAM.
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Upload the temp file to Gemini for analysis
        myfile = genai.upload_file(image_path)
        
        response = model.generate_content([
            myfile,
            "Analyze this image and return 3-5 comma-separated tags describing it. Do not write sentences, just tags."
        ])
        
        return {"label": response.text.strip()}
    except Exception as e:
        print(f"Gemini Tagging Error: {e}")
        return {"label": "AI Tagging Failed"}