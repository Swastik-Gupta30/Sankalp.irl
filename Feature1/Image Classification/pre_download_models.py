from transformers import CLIPProcessor, CLIPModel

def pre_download():
    """Download models at build time so the container doesn't download them on every run.
    This saves bandwidth and start-up time in production.
    """
    print("Pre-downloading necessary NLP models...")
    
    # Download OpenAI CLIP Base Model & Processor
    model_id = "openai/clip-vit-base-patch32"
    
    print("Downloading CLIP Processor...")
    CLIPProcessor.from_pretrained(model_id)
    
    print("Downloading CLIP Model...")
    CLIPModel.from_pretrained(model_id)
    
    print("Finished pre-downloading models. The Docker image is now ready to use.")

if __name__ == "__main__":
    pre_download()
