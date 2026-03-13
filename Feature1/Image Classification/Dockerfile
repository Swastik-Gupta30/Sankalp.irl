FROM python:3.9-slim

WORKDIR /app

# Install OS-level dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy only pip requirements first to cache layers
COPY requirements.txt .

# Install dependencies, bypassing cache warnings for production
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and pre_download script
COPY main.py pre_download_models.py ./

# Download the models natively at build time
RUN python pre_download_models.py

# Expose FastAPI default port
EXPOSE 8000

# Start server: Use uvicorn on all incoming IPs
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
