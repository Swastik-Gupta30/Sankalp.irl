from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import uvicorn
import shutil
import os
from typing import Optional

from text_classifier import load_text_model, classify_text
from audio_classifier import load_audio_model, transcribe_audio
from image_classifier import load_image_model, classify_image

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing AI models...")
    load_text_model()
    load_audio_model()
    load_image_model()
    print("All models loaded successfully!")
    yield
    print("Shutting down AI service...")

app = FastAPI(title="LokaYuktai AI Service", lifespan=lifespan)

class TextClassificationRequest(BaseModel):
    text: str

@app.post("/classify/text")
async def api_classify_text(request: TextClassificationRequest):
    result = classify_text(request.text)
    return result

@app.post("/classify/audio")
async def api_classify_audio(audio: UploadFile = File(...)):
    # Save uploaded file to temp location
    temp_path = f"temp_{audio.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    
    try:
        # Transcribe
        transcribed_text = transcribe_audio(temp_path)
        if not transcribed_text:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
        
        # Classify transcription
        result = classify_text(transcribed_text)
        result["transcribed_text"] = transcribed_text
        return result
    finally:
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/classify/image")
async def api_classify_image(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image")
    
    image_bytes = await image.read()
    result = classify_image(image_bytes)
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
