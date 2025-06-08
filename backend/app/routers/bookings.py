from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Models
class BookingBase(BaseModel):
    service_id: str
    scheduled_at: datetime
    notes: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class BookingResponse(BookingBase):
    id: str
    client_id: str
    provider_id: str
    status: str
    total_price: float
    created_at: datetime
    
    class Config:
        orm_mode = True

class BookingStatusUpdate(BaseModel):
    status: str  # "confirmed" or "rejected"
    notes: Optional[str] = None

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

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking: BookingCreate,
    user = Depends(get_current_user)
):
    """Create a new booking with pending status"""
    supabase = get_supabase()
    
    # Get the service
    service_response = supabase.table("services").select("*").eq("id", booking.service_id).single().execute()
    
    if not hasattr(service_response, 'data') or not service_response.data:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service = service_response.data
    
    # Prepare booking data and convert datetime to string
    booking_data = {
        "service_id": booking.service_id,
        "scheduled_at": booking.scheduled_at.isoformat(),
        "notes": booking.notes,
        "client_id": user.id,
        "provider_id": service["provider_id"],
        "status": "pending",  # Simple pending status without payment
        "total_price": service["price"]
    }
    
    print(f"Creating booking with data: {booking_data}")
    
    # Create the booking
    response = supabase.table("bookings").insert(booking_data).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to create booking")
    
    created_booking = response.data[0]
    
    print(f"Created booking {created_booking['id']} with pending status")
    
    return created_booking

@router.post("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: str,
    status_update: BookingStatusUpdate,
    user = Depends(get_current_user)
):
    """Provider accepts or rejects a booking"""
    supabase = get_supabase()
    
    # Get booking details
    booking_response = supabase.table("bookings").select("*").eq("id", booking_id).single().execute()
    
    if not hasattr(booking_response, 'data') or not booking_response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = booking_response.data
    
    # Verify user is the provider for this booking
    if booking["provider_id"] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this booking")
    
    # Check if booking can be updated
    if booking["status"] not in ["pending"]:
        raise HTTPException(status_code=400, detail="Booking cannot be updated in current status")
    
    # Update booking status
    update_data = {
        "status": status_update.status,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if status_update.notes:
        update_data["notes"] = status_update.notes
    
    # Update the booking
    response = supabase.table("bookings").update(update_data).eq("id", booking_id).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to update booking")
    
    updated_booking = response.data[0]
    
    print(f"Updated booking {booking_id} status to {status_update.status}")
    
    return updated_booking

@router.get("/", response_model=List[BookingResponse])
async def get_user_bookings(
    status: Optional[str] = None,
    user = Depends(get_current_user)
):
    """Get all bookings for the current user (as client or provider)"""
    supabase = get_supabase()
    
    # First, get bookings where user is the client
    client_query = supabase.table("bookings").select("*").eq("client_id", user.id)
    
    if status:
        client_query = client_query.eq("status", status)
    
    client_bookings_response = client_query.execute()
    client_bookings = client_bookings_response.data if hasattr(client_bookings_response, 'data') else []
    
    # Then, get bookings where user is the provider
    provider_query = supabase.table("bookings").select("*").eq("provider_id", user.id)
    
    if status:
        provider_query = provider_query.eq("status", status)
    
    provider_bookings_response = provider_query.execute()
    provider_bookings = provider_bookings_response.data if hasattr(provider_bookings_response, 'data') else []
    
    # Combine and deduplicate
    all_bookings = client_bookings + provider_bookings
    
    # Remove duplicates based on booking ID
    seen_ids = set()
    unique_bookings = []
    for booking in all_bookings:
        if booking["id"] not in seen_ids:
            seen_ids.add(booking["id"])
            unique_bookings.append(booking)
    
    # Sort by created_at (most recent first)
    unique_bookings.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    return unique_bookings

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    user = Depends(get_current_user)
):
    """Get a specific booking"""
    supabase = get_supabase()
    
    # Get the booking
    booking_response = supabase.table("bookings").select("*").eq("id", booking_id).single().execute()
    
    if not hasattr(booking_response, 'data') or not booking_response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = booking_response.data
    
    # Verify user has access to this booking (as client or provider)
    if booking["client_id"] != user.id and booking["provider_id"] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")
    
    return booking

@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    booking: BookingUpdate,
    user = Depends(get_current_user)
):
    """Update a booking (only by client and only certain fields)"""
    supabase = get_supabase()
    
    # Get the existing booking
    existing_response = supabase.table("bookings").select("*").eq("id", booking_id).single().execute()
    
    if not hasattr(existing_response, 'data') or not existing_response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    existing_booking = existing_response.data
    
    # Verify user is the client for this booking
    if existing_booking["client_id"] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this booking")
    
    # Check if booking can be updated (only pending bookings)
    if existing_booking["status"] not in ["pending"]:
        raise HTTPException(status_code=400, detail="Cannot update booking in current status")
    
    # Prepare update data (only allow certain fields)
    update_data = {"updated_at": datetime.utcnow().isoformat()}
    
    if booking.scheduled_at:
        update_data["scheduled_at"] = booking.scheduled_at.isoformat()
    
    if booking.notes is not None:
        update_data["notes"] = booking.notes
    
    # Update the booking
    response = supabase.table("bookings").update(update_data).eq("id", booking_id).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to update booking")
    
    return response.data[0]

@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: str,
    user = Depends(get_current_user)
):
    """Cancel a booking"""
    supabase = get_supabase()
    
    # Get the booking
    booking_response = supabase.table("bookings").select("*").eq("id", booking_id).single().execute()
    
    if not hasattr(booking_response, 'data') or not booking_response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = booking_response.data
    
    # Verify user has permission to cancel (client or provider)
    if booking["client_id"] != user.id and booking["provider_id"] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
    
    # Check if booking can be cancelled
    if booking["status"] in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot cancel booking in current status")
    
    # Update booking status to cancelled
    update_data = {
        "status": "cancelled",
        "updated_at": datetime.utcnow().isoformat()
    }
    
    response = supabase.table("bookings").update(update_data).eq("id", booking_id).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to cancel booking")
    
    print(f"Cancelled booking {booking_id}")
    
    return None 