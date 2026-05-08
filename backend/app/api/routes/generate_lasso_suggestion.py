from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.services.lasso_suggestion import lasso_suggestion
from pydantic import BaseModel
router = APIRouter()

#Turns out Pydantic Models only work for JSON bodies!


@router.post("/generate-lasso-suggestion")
async def generate_lasso_suggestion(mask_input: UploadFile = File(...), image_input: UploadFile = File(...), prompt: str = Form(), token: str = Form(...)):
    try:
        result = await lasso_suggestion(mask_input, image_input, prompt, token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))