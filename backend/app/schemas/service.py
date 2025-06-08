from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

# ServiceCategory Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Service Schemas
class ServiceBase(BaseModel):
    title: str
    description: str
    price: float = Field(ge=0.0)
    duration_minutes: int = Field(ge=15, default=60)
    category_id: str
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    
    @validator('price')
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Price must be non-negative')
        return round(v, 2)  # Round to 2 decimal places

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    category_id: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    
    @validator('price')
    def validate_price(cls, v):
        if v is not None and v < 0:
            raise ValueError('Price must be non-negative')
        if v is not None:
            return round(v, 2)  # Round to 2 decimal places
        return v

class ServiceResponse(ServiceBase):
    id: str
    provider_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class ServiceDetailResponse(ServiceResponse):
    category: CategoryResponse
    provider: dict  # Simplified user info
    
    class Config:
        orm_mode = True 