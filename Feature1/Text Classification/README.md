# Text-to-Issue Classifier

A fully offline municipal complaint classifier that uses local AI models for semantic classification of text input.

## Workflow Pipeline
1. **Text Input**: User enters complaint text in the Gradio interface.
2. **Semantic Classification (all-MiniLM-L6-v2)**: Uses semantic embeddings to calculate the similarity between the complaint and predefined categories.
3. **Instant Results**: Zero-shot classification happens in <20ms on CPU. No API keys or internet required.

## Installation

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the App**
   ```bash
   python app.py
   ```
   Open `http://127.0.0.1:7861` in your browser.
