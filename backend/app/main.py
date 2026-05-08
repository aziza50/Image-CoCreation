from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.routes.extract_features import router as extract_features_router
from app.api.routes.generate_lasso_suggestion import router as generate_lass_suggestion_router

app = FastAPI(title = "Image Co-Creation",
              version = "0.1.0",
              docs_url = None if get_settings().is_production else "/docs",
              redoc_url = None if get_settings().is_production else "/redoc")

settings = get_settings()

#Add to middleware to allow requests from frontend from my .env file
app.add_middleware(
    CORSMiddleware,
    allow_origins = settings.allowed_origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(generate_lass_suggestion_router)
app.include_router(extract_features_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "env": settings.app_env, "version": app.version}