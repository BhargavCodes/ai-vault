# debug_ai.py
import os
import sys
from dotenv import load_dotenv

# Load env vars
load_dotenv()
print("✅ Environment loaded.")

print("Attempting to import AI modules...")

try:
    from app.ai.vision_api import analyze_file_bytes, analyze_via_upload
    print("✅ app.ai.vision_api imported successfully!")
    print(f"   - analyze_file_bytes: {analyze_file_bytes}")
    print(f"   - analyze_via_upload: {analyze_via_upload}")

except ImportError as e:
    print("\n❌ IMPORT ERROR: Python cannot find the function.")
    print(f"Detail: {e}")
    print("Creating a dummy app context to check deeper...")

except SyntaxError as e:
    print(f"\n❌ SYNTAX ERROR in app/ai/vision_api.py")
    print(f"Line {e.lineno}: {e.msg}")
    print(f"Code: {e.text}")

except Exception as e:
    print(f"\n❌ UNEXPECTED ERROR: {e}")
    import traceback
    traceback.print_exc()