import io
import torch
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# Global variables to hold models
processor = None
clip_model = None

CATEGORIES = {
    "Water Works": [
        "water leakage", "no water supply", "sewer overflow", 
        "burst pipe", "flooded street", "contaminated water", 
        "drainage block", "waterlogging", "dirty water"
    ],
    "Public Works Department": [
        "pothole", "damaged road", "broken footpath", "pot hole", 
        "cracked pavement", "sinkhole", "road cave-in", 
        "unpaved road", "uneven street surface", "bridge damage"
    ],
    "Electrical Works": [
        "street light not working", "electric pole damage", 
        "loose hanging wires", "sparking electricity", 
        "power outage", "broken street lamp", "transformer issue"
    ],
    "Sanitation": [
        "garbage accumulation", "unclean street", "waste", "garbage", 
        "trash pile", "littering", "dead animal on road", 
        "overflowing dustbin", "foul smell", "public toilet unhygienic", "plastic waste"
    ]
}

# Pre-compute flattened labels and a mapping back to the main category for O(1) lookup
FLAT_CATEGORIES = []
CATEGORY_MAPPING = {}
for main_cat, sub_cats in CATEGORIES.items():
    for sub_cat in sub_cats:
        FLAT_CATEGORIES.append(sub_cat)
        CATEGORY_MAPPING[sub_cat] = main_cat

# Prepare detailed text labels for CLIP
# Adding context like "a photo of a" often drastically helps performance with CLIP
CLIP_LABELS = [f"a photo of a {cat} problem" for cat in FLAT_CATEGORIES]

@asynccontextmanager
async def lifespan(app: FastAPI):
    global processor, clip_model
    print("Loading models (this will run only once during startup)...")
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    try:
        # Load CLIP model and processor. 
        # clip-vit-base-patch32 is a very strong and somewhat small zero-shot model
        model_id = "openai/clip-vit-base-patch32"
        processor = CLIPProcessor.from_pretrained(model_id)
        clip_model = CLIPModel.from_pretrained(model_id).to(device)
        print("Models loaded successfully! Inference server is ready.")
    except Exception as e:
        print(f"Error loading models: {e}")
        raise e
        
    yield  # Server runs here
    
    print("Shutting down model server...")
    del processor
    del clip_model
    torch.cuda.empty_cache()

app = FastAPI(
    title="Civic Issue Complaint Classifier",
    description="Local image classifier for civic issues using OpenAI CLIP for Zero-Shot classification.",
    version="1.0.0",
    lifespan=lifespan
)

class ClassificationResult(BaseModel):
    main_category: str
    matched_sub_category: str
    confidence_score: float

@app.get("/health")
async def health_check():
    return {"status": "healthy", "gpu_available": torch.cuda.is_available()}

@app.post("/classify", response_model=ClassificationResult)
async def classify_image(file: UploadFile = File(...)):
    """
    Endpoint that accepts an image and maps it directly to the 
    highest scoring civic issue category using CLIP.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    try:
        image_bytes = await file.read()
        raw_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error decoding image: {str(e)}")
        
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print("Classifying image with CLIP...")
    
    # Process both the image and all possible text labels simultaneously
    inputs = processor(text=CLIP_LABELS, images=raw_image, return_tensors="pt", padding=True).to(device)
    
    with torch.inference_mode(): 
        outputs = clip_model(**inputs)
    
    # Get image-text similarity scores
    logits_per_image = outputs.logits_per_image
    # Take the softmax to get the probability distribution over all the possible civic issues
    probs = logits_per_image.softmax(dim=1) 
    
    # Find the best match index
    best_idx = probs.argmax().item()
    confidence_score = probs[0, best_idx].item()
    
    # Resolve index back to text
    best_sub_cat = FLAT_CATEGORIES[best_idx]
    main_cat = CATEGORY_MAPPING[best_sub_cat]
    
    return ClassificationResult(
        main_category=main_cat,
        matched_sub_category=best_sub_cat,
        confidence_score=round(confidence_score, 4)
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
