from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from .base import BaseModel
from enum import Enum

class ServiceCategory(str, Enum):
    HAIR = "hair"
    NAILS = "nails"
    MAKEUP = "makeup"
    SPA = "spa"
    SKIN = "skin"
    OTHER = "other"

class Service(BaseModel, table=True):
    title: str = Field(index=True)
    description: str
    price: float = Field(ge=0.0)
    duration_minutes: int = Field(ge=15, default=60)  # Minimum 15 minutes
    provider_id: str = Field(foreign_key="user.id")
    category_id: str = Field(foreign_key="servicecategory.id")
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = Field(default=True)
    
    # Relationships
    provider: "User" = Relationship(back_populates="services")
    category: ServiceCategory = Relationship(back_populates="services")
    bookings: List["Booking"] = Relationship(back_populates="service") 