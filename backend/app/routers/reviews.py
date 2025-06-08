from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Models
class ReviewBase(BaseModel):
    booking_id: str
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str
    client_id: str
    provider_id: str
    service_id: str
    created_at: str
    
    class Config:
        orm_mode = True

# Router
router = APIRouter()
security = HTTPBearer()

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    supabase = get_supabase()
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review: ReviewCreate,
    user = Depends(get_current_user)
):
    """Create a review for a completed booking"""
    supabase = get_supabase()
    
    # Get the booking
    booking_response = supabase.table("bookings").select("*").eq("id", review.booking_id).single().execute()
    
    if not hasattr(booking_response, 'data') or not booking_response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = booking_response.data
    
    # Check if user is the client of this booking
    if booking["client_id"] != user.id:
        raise HTTPException(status_code=403, detail="Only the client can review a booking")
    
    # Check if booking is completed
    if booking["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed bookings")
    
    # Check if rating is valid (1-5)
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if review already exists
    existing_review = supabase.table("reviews").select("*").eq("booking_id", review.booking_id).execute()
    
    if hasattr(existing_review, 'data') and existing_review.data:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")
    
    # Create review
    review_data = review.dict()
    review_data["client_id"] = user.id
    review_data["provider_id"] = booking["provider_id"]
    review_data["service_id"] = booking["service_id"]
    
    response = supabase.table("reviews").insert(review_data).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to create review")
    
    # Update provider's average rating
    provider_id = booking["provider_id"]
    reviews_response = supabase.table("reviews").select("rating").eq("provider_id", provider_id).execute()
    
    if hasattr(reviews_response, 'data') and reviews_response.data:
        ratings = [r["rating"] for r in reviews_response.data]
        avg_rating = sum(ratings) / len(ratings)
        
        # Update provider profile
        supabase.table("provider_profiles").update({
            "ratings_average": avg_rating,
            "ratings_count": len(ratings)
        }).eq("user_id", provider_id).execute()
    
    return response.data[0]

@router.get("/provider/{provider_id}", response_model=List[ReviewResponse])
async def get_provider_reviews(provider_id: str):
    """Get all reviews for a provider"""
    supabase = get_supabase()
    
    response = supabase.table("reviews").select("*").eq("provider_id", provider_id).execute()
    
    if hasattr(response, 'data'):
        return response.data
    return []

@router.get("/service/{service_id}", response_model=List[ReviewResponse])
async def get_service_reviews(service_id: str):
    """Get all reviews for a service"""
    supabase = get_supabase()
    
    response = supabase.table("reviews").select("*").eq("service_id", service_id).execute()
    
    if hasattr(response, 'data'):
        return response.data
    return []
