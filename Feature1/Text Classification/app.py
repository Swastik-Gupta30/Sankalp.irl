import gradio as gr
import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util

# --- Model Loading ---
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

def classify_text(text: str):
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
    
    summary = text[:100]
    if len(text) > 100:
        summary += "..."
    
    return {
        "category": category,
        "department": department,
        "severity": severity,
        "summary": summary,
        "confidence_score": f"{best_score:.2f}"
    }

def gradio_interface(text):
    if not text or not text.strip():
        return {"error": "No input provided"}
    
    json_result = classify_text(text)
    return json_result

# Construct Gradio app
with gr.Blocks(title="Text Issue Classifier") as app:
    gr.Markdown("# 🛡️ Text-to-Issue Classifier")
    gr.Markdown("Zero-shot semantic classification using `all-MiniLM-L6-v2`. No API calls required.")
    
    with gr.Row():
        with gr.Column():
            text_input = gr.Textbox(placeholder="Enter your complaint (e.g., 'pothole on MG Road')", label="Complaint Text", lines=3)
            submit_btn = gr.Button("Submit Complaint", variant="primary")
            
        with gr.Column():
            classification_output = gr.JSON(label="Semantic Classification Output")
            
    submit_btn.click(
        fn=gradio_interface, 
        inputs=text_input, 
        outputs=[classification_output]
    )

if __name__ == "__main__":
    app.queue()  # enables request queue (recommended for Gradio apps)

    app.launch(
        server_name="127.0.0.1",  # localhost
        share=False,              # no public link
        show_error=True           # better debugging
    )
