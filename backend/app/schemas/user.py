from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from ..models.user import UserRole

# Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Optional[UserRole] = UserRole.CLIENT
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

# Schema for creating a user
class UserCreate(UserBase):
    supabase_id: str

# Schema for updating a user
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
# Schema for user response
class UserResponse(UserBase):
    id: str
    supabase_id: str
    created_at: datetime
    updated_at: datetime
    is_verified: bool
    
    class Config:
        orm_mode = True

# Schema for provider profile
class ProviderProfile(UserResponse):
    stripe_account_id: Optional[str] = None
    
    class Config:
        orm_mode = True 