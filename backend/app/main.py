from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.routes.extract_features import router as extract_features_router

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

app.include_router(extract_features_router, prefix = "/extract-features", tags = ["extract-features"])

@app.get("/health")
def health_check():
    return {"status": "ok", "env": settings.app_env, "version": app.version}