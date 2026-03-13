# Feature 3: Issue Verification AI Pipeline

This directory contains the AI-powered backend for verifying civic issue resolutions. It checks if previously reported problems (like potholes) are fixed based on "before" and "after" photos, while also validating that the "after" image is not an AI-generated deepfake.

## Architecture & Models Used

1. **Deepfake Detection**: Uses `umm-maybe/AI-image-detector` (via Hugging Face `transformers` pipeline) to classify images as 'artificial' or 'human'. If the 'after' image is flagged as mathematically artificial with high confidence (>0.7), the submission is rejected.
2. **Vision Reasoning**: Uses `vikhyatk/moondream2` as the Vision Language Model (VLM). This model is highly efficient (under 2B parameters) and can run on CPUs smoothly while still parsing the images intelligently. It combines the 'before' and 'after' images to output a JSON verification response.

## Installation

### 1. Prerequisites
- **Python 3.9+**
- **Hardware**: Moondream2 is highly efficient and optimized. It does not strictly require a GPU; it can run fairly well on modern CPUs or laptop GPUs. This greatly reduces computational requirements.

### 2. Setup Virtual Environment
```bash
cd Feature3
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

*(Note for Windows users: if you have a compatible NVIDIA GPU, ensure you install `torch` with CUDA support as per PyTorch's official instructions to ensure processing is fast: `pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118` or similar).*

## Running the Server

Start the FastAPI development server:
```bash
uvicorn main:app --reload
```
The server will start on `http://localhost:8000`. 
*Note: The first time you run this, it will download a few gigabytes of model weights from Hugging Face for Moondream2 and the fake detection model. This is significantly smaller and faster than 7B parameter models.*

## API Endpoints

### `POST /verify-issue`

Accepts `multipart/form-data` with two image files:
- `before_image`: The photo of the original issue.
- `after_image`: The photo taken by the officer after supposedly fixing the issue.

**Example Response**:
```json
{
  "ai_generated": false,
  "issue_type": "pothole",
  "resolved": true,
  "confidence": 0.95
}
```

If a fake is detected:
```json
{
  "issue_type": "unknown",
  "resolved": false,
  "confidence": 0.82,
  "ai_generated": true,
  "message": "The uploaded 'after' image appears to be AI-generated."
}
```

## Testing Locally

A basic testing script is included that generates dummy colored images and sends them to the local server to verify the networking is working.

In a separate terminal (while the server is running):
```bash
# Don't forget to activate the venv
python test_api.py
```
