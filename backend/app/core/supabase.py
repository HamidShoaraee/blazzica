from supabase import create_client, Client
from .config import SUPABASE_URL, SUPABASE_KEY

def get_supabase() -> Client:
    """Get a Supabase client instance"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase URL and key must be set in environment variables")
    return create_client(SUPABASE_URL, SUPABASE_KEY)
