'''
Receive 5 document links from frontend, extract features from them, reduce dimensionality, and save in vector database
'''
import base64
from PIL import Image
import certifi
import cv2
import requests
from io import BytesIO
from fastapi import APIRouter, HTTPException
from app.services.feature_extractor import FeatureExtractor
import torch
from app.services.dimentionality import PCA_DimensionalityReducer
from app.db.supabase import create_supabase_client
import numpy as np
from torchvision import transforms

router = APIRouter()


@router.post("/")
def extract_features(image_urls: list[str]):
    print("HERE")
    if (len(image_urls) <1 or len(image_urls) > 5):
        raise (HTTPException(status_code = 400, detail= "invalid # of images"))
    
    images = []
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
    ])
    for url in image_urls:
        print(repr(url[:50]))  # print first 50 chars to see exactly what's coming in

        if not url.startswith("data:image/"):
            img_data = requests.get(url, verify = certifi.where()).content
        else:
            header, data = url.split(",", 1)
            img_data = (base64.b64decode(data))


        img = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_COLOR)
        if img is not None: 
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(img)
            img = transform(img)
            images.append(img)
    #resnet-50
    images = torch.stack(images)
    feature_extractor = FeatureExtractor()
    features = feature_extractor(images)
    #pca
    pca_reducer = PCA_DimensionalityReducer(n_components=5)
    features = pca_reducer.fit_transform(features)
    #save to vector database
    supabase_client = create_supabase_client()
    for i, feature in enumerate(features):
        supabase_client.table("image_features").insert({"image_url": image_urls[i], "features": feature.tolist()}).execute()
    return {"features": features.tolist()}