from functools import lru_cache
from fastapi import HTTPException
from supabase import create_client, Client
from app.core.config import get_settings

@lru_cache()
def create_supabase_client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_publishable_key)

def get_user_id(token: str) -> str:
    supabase = create_supabase_client()
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception as e:
        print(f"Error occurred while fetching user ID: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def create_supabase_client_with_service_role() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def get_user_styles(user_id:str) -> dict:
    supabase = create_supabase_client_with_service_role()
    try:
        response = supabase.table("user_style").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user styles: {str(e)}")
    