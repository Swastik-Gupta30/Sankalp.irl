# Offline Audio -> Issue Classifier

A fully offline municipal complaint classifier that uses local AI models for both speech-to-text and semantic classification.

## Workflow Pipeline
1. **Audio Input**: Gradio interface captures audio from microphone or files.
2. **Speech to Text (Whisper base)**: Uses OpenAI's `whisper base` model locally to transcribe audio (supports English/Hindi).
3. **Semantic Classification (all-MiniLM-L6-v2)**: Uses semantic embeddings to calculate the similarity between the complaint and predefined categories.
4. **Instant Results**: Zero-shot classification happens in <20ms on CPU. No API keys or internet required.

## Installation

1. **Install FFmpeg**
   Ensure `ffmpeg` is installed on your system.
   
2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the App**
   ```bash
   python app.py
   ```
   Open `http://127.0.0.1:7861` in your browser.
