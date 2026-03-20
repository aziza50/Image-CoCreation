from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.routes.auth import router as auth_router
from app.api.routes.styles import router as styles_router
from app.api.routes.generation import generation_router, feedback_router

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

app.include_router(auth_router, prefix = "/auth", tags = ["auth"])
app.include_router(styles_router, prefix = "/styles", tags = ["styles"])
app.include_router(generation_router, prefix = "/generation", tags = ["generation"])
app.include_router(feedback_router, prefix = "/feedback", tags = ["feedback"])

@app.get("/health")
def health_check():
    return {"status": "ok", "env": settings.app_env, "version": app.version}