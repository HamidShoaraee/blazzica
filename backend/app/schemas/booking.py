from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from ..models.booking import BookingStatus, PaymentStatus

class BookingBase(BaseModel):
    service_id: str
    start_time: datetime
    end_time: datetime
    notes: Optional[str] = None
    location: Optional[str] = None
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[BookingStatus] = None
    notes: Optional[str] = None
    location: Optional[str] = None
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if v and 'start_time' in values and values['start_time'] and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v

class BookingResponse(BookingBase):
    id: str
    client_id: str
    provider_id: str
    status: BookingStatus
    payment_status: PaymentStatus
    price: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class BookingDetailResponse(BookingResponse):
    service: dict  # Simplified service info
    client: dict   # Simplified client info
    provider: dict # Simplified provider info
    
    class Config:
        orm_mode = True

# Payment related schemas
class PaymentIntent(BaseModel):
    booking_id: str

class PaymentResponse(BaseModel):
    checkout_url: str
    payment_intent_id: str 