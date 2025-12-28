
# app/ai/summarize_api.py
import google.generativeai as genai
import os

# Configure the Gemini API client using the environment variable
# NOTE: The environment variable GEMINI_API_KEY must be set
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))    # type: ignore


def summarize_text(content: str) -> str:
    """
    Uses the Gemini API (gemini-2.5-flash) to generate a bulleted summary of text content.

    Args:
        content (str): The large block of text to be summarized.

    Returns:
        str: The summary text from the model.
    """
    # Use a descriptive prompt for the desired format (3-5 bullet points)
    prompt = f"Summarize this text in 3-5 concise bullet points:\n\n{content}"
    
    # Call the model
    # Use the specific model name "gemini-2.5-flash" if the "pro" model is too slow or costly
    model = genai.GenerativeModel("gemini-2.5-flash") # type: ignore
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini Summarization API error: {e}")
        return "Error: Could not generate summary."