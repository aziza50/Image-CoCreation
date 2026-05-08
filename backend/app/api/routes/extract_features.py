'''
Receive 5 document links from frontend, extract features from them, reduce dimensionality, and save in vector database
'''
from PIL import Image
from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from app.services.feature_extractor import FeatureExtractor
import numpy as np
from PIL import Image
from app.services.dimentionality import PCA_DimensionalityReducer
from pinecone import Pinecone
import app.core.config as config
from io import BytesIO
from app.db.supabase_db import create_supabase_client, get_user_id, create_supabase_client_with_service_role

supabase = create_supabase_client_with_service_role()
router = APIRouter()
settings = config.get_settings()

@router.post("/extract-features") #File means parameter should be extracted from form data not from json body and ... means it's required
async def extract_features(images: list[UploadFile] = File(...), authorization: str = Header(None)):
    if (len(images) <1 or len(images) > 5):
        raise (HTTPException(status_code = 400, detail= "invalid # of images"))
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    user_token = authorization.replace("Bearer ", "")
    user_id = get_user_id(user_token)
    processed_images = []
    for img in images:
        #UploadFile object has .read() method and it is memory efficient
        content = await img.read()
        img = Image.open(BytesIO(content)).convert("RGB")   
        img = img.resize((224, 224)) #CLIP expects 224x224 images
        processed_images.append(img)

    feature_extractor = FeatureExtractor()
    features = feature_extractor.forward(processed_images)
    pca = PCA_DimensionalityReducer()
    reduced_features = pca.transform(features)
    median = np.mean(reduced_features, axis=0)
    #now use cosine similarity to find the closest 10 images in the vector database and return their metadata (title, artist, year)
    pc = Pinecone(api_key = settings.pinecone_api_key)
    index = pc.Index("wiki-art-embeddings")
    try:
        results = index.query(
            vector=median.tolist(),
            top_k=10,
            include_metadata=True
        )
    except Exception as e:
        print(f"Error occurred while querying Pinecone: {e}")
        raise HTTPException(status_code=500, detail="Error occurred while querying Pinecone")
    #already should be sorted by cosine similarity so I'll for 
    #now just do something like 20% surrealism, 20% abstract, 20% impressionism, 20% renaissance, 20% baroque as an example
    mapping = {
        "style": {},
        "genre": {},
        "artist": {},
    }
    for res in results["matches"]:
        mapping["style"][res["metadata"]["style"]] = round(mapping["style"].get(res["metadata"]["style"], 0) + 1/10, 2)
        mapping["genre"][res["metadata"]["genre"]] = round(mapping["genre"].get(res["metadata"]["genre"], 0) + 1/10, 2)
        mapping["artist"][res["metadata"]["artist"]] = round(mapping["artist"].get(res["metadata"]["artist"], 0) + 1/10, 2)

  
    try:
        response = (supabase.table("user_style")
                .insert({
                    "user_id": user_id,
                    "style": mapping["style"],
                    "genre": mapping["genre"],
                    "artist": mapping["artist"],
                })
                .execute())
        print("Supabase insert response:", response)
    except Exception as e:
        print(f"Error occurred while inserting into Supabase: {e}")
        raise HTTPException(status_code=500, detail="Error occurred while inserting into Supabase")
    return mapping

    