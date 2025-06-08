from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Models
class ProviderProfileBase(BaseModel):
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None
    location: Optional[str] = None
    specialties: Optional[List[str]] = None
    availability: Optional[Dict[str, Any]] = None

class ProviderProfileCreate(ProviderProfileBase):
    pass

class ProviderProfileUpdate(ProviderProfileBase):
    pass

class ProviderProfileResponse(ProviderProfileBase):
    id: str
    user_id: str
    ratings_average: float
    ratings_count: int
    
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

@router.post("/", response_model=ProviderProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_provider_profile(
    profile: ProviderProfileCreate,
    user = Depends(get_current_user)
):
    """Create a new provider profile"""
    supabase = get_supabase()
    
    # Check if user is a provider
    user_response = supabase.table("users").select("*").eq("id", user.id).execute()
    
    
    user_data = user_response.data[0] if user_response.data else None

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_data.get("role") not in ["provider", "pending_provider"]:
        raise HTTPException(status_code=403, detail="Only providers can create provider profiles")
    
    # Check if profile already exists
    existing_profile = supabase.table("provider_profiles").select("*").eq("user_id", user.id).execute()
    
    if hasattr(existing_profile, 'data') and existing_profile.data:
        raise HTTPException(status_code=400, detail="Provider profile already exists")
    
    # Create provider profile
    profile_data = profile.dict()
    
    # Debug availability data
    if profile_data.get("availability"):
        print(f"Creating profile with availability data: {profile_data['availability']}")
    else:
        print("No availability data in profile creation")
    
    profile_data["user_id"] = user.id
    # Set default values for new provider profiles
    profile_data["ratings_average"] = 0.0
    profile_data["ratings_count"] = 0
    
    print(f"Final profile data being inserted: {profile_data}")
    response = supabase.table("provider_profiles").insert(profile_data).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to create provider profile")
    
    
    result_data = response.data[0]
    print(f"Created profile result: {result_data}")
    return result_data

@router.get("/{provider_id}", response_model=ProviderProfileResponse)
async def get_provider_profile(provider_id: str):
    """Get a provider's profile"""
    supabase = get_supabase()
    
    response = supabase.table("provider_profiles").select("*").eq("user_id", provider_id).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    profile_data = response.data[0]
    return profile_data

@router.put("/", response_model=ProviderProfileResponse)
async def update_provider_profile(
    profile: ProviderProfileUpdate,
    user = Depends(get_current_user)
):
    """Update the current provider's profile"""
    supabase = get_supabase()
    
    # Check if user is a provider
    user_response = supabase.table("users").select("*").eq("id", user.id).execute()
    
    
    user_data = user_response.data[0] if user_response.data else None

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_data.get("role") not in ["provider", "pending_provider"]:
        raise HTTPException(status_code=403, detail="Only providers can update provider profiles")
    
    # Check if profile exists
    existing_profile = supabase.table("provider_profiles").select("*").eq("user_id", user.id).execute()
    
    if not hasattr(existing_profile, 'data') or not existing_profile.data:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    # Update provider profile
    profile_data = profile.dict(exclude_unset=True)
    
    # Debug availability data
    if profile_data.get("availability"):
        print(f"Updating profile with availability data: {profile_data['availability']}")
        print(f"Availability data type: {type(profile_data['availability'])}")
    else:
        print("No availability data in profile update")
    
    # Log the data being sent to the database
    print(f"Updating profile with data: {profile_data}")
    response = supabase.table("provider_profiles").update(profile_data).eq("user_id", user.id).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to update provider profile")
    
    updated_profile = response.data[0]
    print(f"Updated profile result: {updated_profile}")
    
    # Verify availability was saved
    if updated_profile.get("availability"):
        print(f"Availability successfully saved: {updated_profile['availability']}")
    else:
        print("Warning: No availability data in updated profile")
    
    return updated_profile
