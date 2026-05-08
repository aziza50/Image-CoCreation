from transformers import CLIPImageProcessor, CLIPModel
from torchvision import transforms
import torch
'''
For feature extraction, I will be using CLIP instead of ResNet to get a better
semantic relationshiop between words and images (really good when I want to 
prompt)!
'''

class FeatureExtractor():
    def __init__(self):
        self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.processor = CLIPImageProcessor.from_pretrained("openai/clip-vit-base-patch32")

    #list of 5 images from onboarding
    def forward(self, images):
        #CLIP Image Processor has its own image transformations so no need to create my own custom transforms
        processed_images = self.processor(images, return_tensors="pt")
        with torch.no_grad():
            embeddings = self.model.get_image_features(**processed_images).pooler_output
        embeddings /= embeddings.norm(dim=-1, keepdim=True)
        return embeddings.numpy()
