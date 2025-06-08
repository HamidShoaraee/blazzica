# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, Union
import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
import json

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Address model for Canadian addresses
class AddressModel(BaseModel):
    street_address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    country: Optional[str] = "Canada"
    postal_code: Optional[str] = None

# Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[Union[AddressModel, Dict[str, Any]]] = None

class UserSignUp(BaseModel):
    password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    address: Optional[AddressModel] = None
    role: Optional[str] = "client"  # Default to client
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[Union[AddressModel, Dict[str, Any]]] = None
    role: str
    
    class Config:
        orm_mode = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordUpdateRequest(BaseModel):
    access_token: str
    password: str

# Router
router = APIRouter()
security = HTTPBearer()

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserSignUp):
    """Register a new user"""
    supabase = get_supabase()
    
    # Validate role
    if user.role not in ["client", "provider"]:
        raise HTTPException(status_code=400, detail="Role must be either 'client' or 'provider'")
    
    try:
        # Create auth user
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        # Set the appropriate role
        role = user.role
        if role == "provider":
            role = "pending_provider"  # New providers start as pending
        
        # Create user profile with combined name field
        full_name = f"{user.first_name} {user.last_name}"
        
        # Convert address to JSON string for storage if provided
        address_json = None
        if user.address:
            address_dict = user.address.dict(exclude_none=True)
            if address_dict:  # Only store if there's actual address data
                address_json = json.dumps(address_dict)
        
        user_data = {
            "id": auth_response.user.id,
            "email": user.email,
            "full_name": full_name,
            "phone_number": user.phone_number,
            "address": address_json,
            "role": role
        }
        
        profile_response = supabase.table("users").insert(user_data).execute()
        
        return {"message": "User created successfully", "user_id": auth_response.user.id}
    except Exception as e:
        # Handle specific error cases
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(user: UserLogin):
    """Log in a user"""
    supabase = get_supabase()
    
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/reset-password")
async def reset_password(reset_request: PasswordResetRequest):
    """Send password reset email"""
    supabase = get_supabase()
    
    try:
        # Check if user exists
        user_response = supabase.table("users").select("*").eq("email", reset_request.email).execute()
        
        if not user_response.data:
            # Don't reveal if email exists or not for security
            return {"message": "If the email exists in our system, a password reset link has been sent."}
        
        # Send password reset email with redirect URL
        response = supabase.auth.reset_password_email(
            reset_request.email,
            {
                "redirect_to": "http://localhost:3000/reset-password"
            }
        )
        
        return {"message": "If the email exists in our system, a password reset link has been sent."}
    except Exception as e:
        # Don't reveal specific errors for security
        return {"message": "If the email exists in our system, a password reset link has been sent."}

@router.post("/update-password")
async def update_password(update_request: PasswordUpdateRequest):
    """Update password using reset token"""
    
    try:
        # Verify the token first using our main client
        supabase = get_supabase()
        try:
            user_response = supabase.auth.get_user(update_request.access_token)
            if not user_response.user:
                raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        except Exception as e:
            print(f"Token verification error: {e}")
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Use direct HTTP request to Supabase Auth API to update password
        url = f"{SUPABASE_URL}/auth/v1/user"
        headers = {
            "Authorization": f"Bearer {update_request.access_token}",
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY
        }
        
        data = {
            "password": update_request.password
        }
        
        response = requests.put(url, json=data, headers=headers)
        
        if response.status_code == 200:
            return {"message": "Password updated successfully"}
        else:
            print(f"Supabase API error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=400, detail="Failed to update password")
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        print(f"Password update error: {e}")
        raise HTTPException(status_code=400, detail="Failed to update password. The reset link may have expired.")

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get the current user's profile"""
    supabase = get_supabase()
    
    try:
        # Verify token
        user = supabase.auth.get_user(credentials.credentials)
        
        # Get user profile
        response = supabase.table("users").select("*").eq("id", user.user.id).single().execute()
        
        if not hasattr(response, 'data') or not response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        user_data = response.data
        
        # Parse address JSON if it exists and convert to dict for frontend
        if user_data.get('address'):
            try:
                address_dict = json.loads(user_data['address'])
                # Keep as dict instead of converting to AddressModel for API response
                user_data['address'] = address_dict
            except (json.JSONDecodeError, TypeError):
                # If parsing fails, set address to None
                user_data['address'] = None
        
        return user_data
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@router.put("/me", response_model=UserResponse)
async def update_user(
    user_update: UserBase,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update the current user's profile"""
    supabase = get_supabase()
    
    try:
        # Verify token
        user = supabase.auth.get_user(credentials.credentials)
        
        # Update user profile
        update_data = user_update.dict(exclude_unset=True)
        
        # Convert address to JSON string for storage if provided
        if 'address' in update_data and update_data['address']:
            if isinstance(update_data['address'], AddressModel):
                address_dict = update_data['address'].dict(exclude_none=True)
                update_data['address'] = json.dumps(address_dict) if address_dict else None
            elif isinstance(update_data['address'], dict):
                update_data['address'] = json.dumps(update_data['address'])
        
        response = supabase.table("users").update(update_data).eq("id", user.user.id).execute()
        
        if not hasattr(response, 'data') or not response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        user_data = response.data[0]
        
        # Parse address JSON if it exists and convert to dict for frontend
        if user_data.get('address'):
            try:
                address_dict = json.loads(user_data['address'])
                # Keep as dict instead of converting to AddressModel for API response
                user_data['address'] = address_dict
            except (json.JSONDecodeError, TypeError):
                user_data['address'] = None
        
        return user_data
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@router.post("/provider-application")
async def apply_to_be_provider(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Apply to become a service provider"""
    supabase = get_supabase()
    
    try:
        # Verify token
        user = supabase.auth.get_user(credentials.credentials)
        
        # Update user role to pending_provider
        response = supabase.table("users").update({"role": "pending_provider"}).eq("id", user.user.id).execute()
        
        if not hasattr(response, 'data') or not response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return {"message": "Application submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user details by ID (for enriching booking data)"""
    supabase = get_supabase()
    
    try:
        # Verify token (ensure user is authenticated)
        supabase.auth.get_user(credentials.credentials)
        
        # Get user profile by ID
        response = supabase.table("users").select("*").eq("id", user_id).single().execute()
        
        if not hasattr(response, 'data') or not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = response.data
        
        # Parse address JSON if it exists and convert to dict for frontend
        if user_data.get('address'):
            try:
                address_dict = json.loads(user_data['address'])
                # Keep as dict instead of converting to AddressModel for API response
                user_data['address'] = address_dict
            except (json.JSONDecodeError, TypeError):
                # If parsing fails, set address to None
                user_data['address'] = None
        
        return user_data
    except Exception as e:
        if "User not found" in str(e):
            raise e
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")