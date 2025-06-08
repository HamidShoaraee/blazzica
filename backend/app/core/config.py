"""
Configuration settings for the Blazzica API.

This module loads environment variables and provides configuration
for the entire application. Settings can be imported as:
    from app.core.config import settings
"""

import os
from dotenv import load_dotenv
from pydantic import BaseSettings

# Load environment variables from .env file
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# API configuration
API_PREFIX = "/api"
API_VERSION = "0.1.0"
API_TITLE = "Blazzica API Service"

# CORS configuration
CORS_ORIGINS = [
    "http://localhost:3000",  # Frontend dev server
    "https://blazzica.com",   # Production domain
]

class Settings(BaseSettings):
    PROJECT_NAME: str = API_TITLE
    VERSION: str = API_VERSION
    API_V1_STR: str = API_PREFIX
    SUPABASE_URL: str = SUPABASE_URL
    SUPABASE_KEY: str = SUPABASE_KEY

    class Config:
        env_file = ".env"

settings = Settings()
