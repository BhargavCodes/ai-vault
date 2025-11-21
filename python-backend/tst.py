from huggingface_hub import InferenceClient
import os

client = InferenceClient(
    model="meta-llama/Llama-3.1-8B-Instruct",   # 👈 required!
    api_key=os.getenv("HUGGINGFACE_API_KEY")
)

result = client.text_generation(
    "Explain AI in one sentence.",
    max_new_tokens=50
)

print(result)
