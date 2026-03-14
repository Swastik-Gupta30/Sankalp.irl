FROM python:3.9-slim

# Install system dependencies, largely required by Whisper, OpenCV, etc.
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    git \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# The models are quite large and download at runtime.
# Running them once during build pre-downloads the models.
# Split into multiple layers to avoid single giant layer issues.
COPY text_classifier.py .
RUN python -c "from text_classifier import load_text_model; load_text_model()" \
 && rm -rf /root/.cache/pip

COPY audio_classifier.py .
RUN python -c "from audio_classifier import load_audio_model; load_audio_model()" \
 && rm -rf /root/.cache/pip

COPY image_classifier.py .
RUN python -c "from image_classifier import load_image_model; load_image_model()" \
 && rm -rf /root/.cache/pip

COPY . .

# Final check
RUN python -c "print('Pre-download successful')"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
