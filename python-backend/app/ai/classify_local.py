from transformers import AutoModelForImageClassification, AutoImageProcessor
from PIL import Image
import torch

processor = AutoImageProcessor.from_pretrained("google/vit-base-patch16-224")
model = AutoModelForImageClassification.from_pretrained("google/vit-base-patch16-224")

def classify_image(image_path: str) -> dict:
    image = Image.open(image_path).convert("RGB")
    inputs = processor(image, return_tensors="pt")
    outputs = model(**inputs)
    logits = outputs.logits
    pred = logits.softmax(1).argmax().item()
    label = model.config.id2label[pred]

    return {"label": label}

