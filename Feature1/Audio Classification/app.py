import gradio as gr
import whisper
import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util

# --- FFmpeg setup ---
# Keeping this as Whisper requires FFmpeg to process audio files
ffmpeg_path = r"C:\Users\Daksh\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin"
if os.path.exists(ffmpeg_path) and ffmpeg_path not in os.environ["PATH"]:
    os.environ["PATH"] += os.pathsep + ffmpeg_path

# --- Model Loading ---
print("Loading Whisper 'base.en' model...")
whisper_model = whisper.load_model("base.en")

...

def process_audio(audio_path):
    ...
    result = whisper_model.transcribe(
        audio_path,
        fp16=False,
        language="en",
        task="transcribe",
        temperature=0.0,
        beam_size=5,
        best_of=5
    )
    transcribed_text = result["text"].strip()

print("Loading SentenceTransformer 'all-MiniLM-L6-v2'...")
embedder = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')

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

# Precompute embeddings for all issues within categories
category_labels = []
category_descriptions = []

for dept, issues in CATEGORIES.items():
    for issue in issues:
        category_labels.append(dept)
        category_descriptions.append(issue)

print(f"Precomputing embeddings for {len(category_descriptions)} keywords...")
category_embeddings = embedder.encode(category_descriptions, convert_to_tensor=True)

def classify_text(text):
    if not text.strip():
        return {
            "category": "Unknown",
            "department": "Unknown",
            "severity": "Low",
            "summary": "No content",
            "confidence_score": "0.00"
        }
    
    # 1. Get embedding for user complaint
    complaint_embedding = embedder.encode(text, convert_to_tensor=True)
    
    # 2. Compute cosine similarities
    cosine_scores = util.cos_sim(complaint_embedding, category_embeddings)[0]
    
    # 3. Find index of best match
    best_match_idx = int(np.argmax(cosine_scores.cpu().numpy()))
    best_score = float(cosine_scores[best_match_idx])
    
    # 4. Map back to department
    department = category_labels[best_match_idx]
    category = category_descriptions[best_match_idx]
    
    # Simple severity logic based on similarity score
    severity = "High" if best_score > 0.7 else "Medium" if best_score > 0.5 else "Low"
    
    return {
        "category": category,
        "department": department,
        "severity": severity,
        "summary": text[:100] + "..." if len(text) > 100 else text,
        "confidence_score": f"{best_score:.2f}"
    }

def process_audio(audio_path):
    if not audio_path:
        return {"error": "No audio provided"}, ""

    try:
        print(f"Transcribing audio...")
        # fp16=False for CPU support
        result = whisper_model.transcribe(audio_path, fp16=False)
        transcribed_text = result["text"].strip()
        print(f"Transcribed Text: '{transcribed_text}'")
        
        if not transcribed_text:
            return {"error": "Could not extract text from audio"}, ""

        # Perform offline semantic classification
        classification = classify_text(transcribed_text)
        return classification, transcribed_text
        
    except Exception as e:
        print(f"Error processing: {e}")
        return {"error": str(e)}, ""

def gradio_interface(audio):
    if audio is None:
        return "Please record or upload an audio.", {"error": "No input provided"}
    
    json_result, text = process_audio(audio)
    return text, json_result

# Construct Gradio app
with gr.Blocks(title="Offline Audio Classifier") as app:
    gr.Markdown("# 🛡️ Offline Civic Complaint Classifier")
    gr.Markdown("Zero-shot semantic classification using `all-MiniLM-L6-v2`. No API calls required.")
    
    with gr.Row():
        with gr.Column():
            audio_input = gr.Audio(sources=["microphone", "upload"], type="filepath", label="Input Audio")
            submit_btn = gr.Button("Submit Complaint", variant="primary")
            
        with gr.Column():
            transcription_output = gr.Textbox(label="Transcribed Text", lines=4)
            classification_output = gr.JSON(label="Semantic Classification Output")
            
    submit_btn.click(
        fn=gradio_interface, 
        inputs=audio_input, 
        outputs=[transcription_output, classification_output]
    )
if __name__ == "__main__":
    app.queue()  # enables request queue (recommended for Gradio apps)

    app.launch(
        server_name="127.0.0.1",  # localhost
        share=False,              # no public link
        show_error=True           # better debugging
    )
