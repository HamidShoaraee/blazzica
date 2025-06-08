from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from .base import BaseModel
from enum import Enum
from pydantic import EmailStr
from datetime import datetime

class UserRole(str, Enum):
    CLIENT = "client"
    PROVIDER = "provider"
    PENDING_PROVIDER = "pending_provider"
    ADMIN = "admin"

class User(BaseModel, table=True):
    supabase_id: str = Field(index=True, unique=True)
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = Field(default=UserRole.CLIENT)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    stripe_account_id: Optional[str] = None
    is_verified: bool = Field(default=False)
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    services: List["Service"] = Relationship(back_populates="provider", sa_relationship_kwargs={"lazy": "selectin"})
    bookings_as_client: List["Booking"] = Relationship(
        back_populates="client", 
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "Booking.client_id"
        }
    )
    bookings_as_provider: List["Booking"] = Relationship(
        back_populates="provider", 
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "Booking.provider_id"
        }
    ) 