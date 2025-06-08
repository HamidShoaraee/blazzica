from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from dotenv import load_dotenv

# Remove this problematic import
# from app.core.db import validate_database_schema

# Configure the path for relative imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import directly from relative paths
from core.config import CORS_ORIGINS, API_TITLE, API_VERSION
from routers.auth import router as auth_router
from routers.services import router as services_router
from routers.bookings import router as bookings_router
from routers.providers import router as providers_router
from routers.reviews import router as reviews_router
from routers.admin import router as admin_router

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()

# Include all routers with proper prefixes
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(services_router, prefix="/api/services", tags=["Services"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(providers_router, prefix="/api/providers", tags=["Providers"])
app.include_router(reviews_router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

# Simple startup event
@app.on_event("startup")
async def startup_event():
    print("Application started successfully")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Blazzica API Service",
        "documentation": "/docs",
        "version": API_VERSION
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}