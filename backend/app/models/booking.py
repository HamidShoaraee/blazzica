from enum import Enum

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    FAILED = "failed"

class Booking(BaseModel):
    id: str
    service_id: str
    client_id: str
    provider_id: str
    status: str  # pending, confirmed, completed, cancelled
    scheduled_at: datetime
    created_at: datetime
    updated_at: datetime
    total_price: float
    notes: Optional[str] = None
    
    # Payment info
    payment_status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    stripe_payment_intent_id: Optional[str] = None
    stripe_checkout_id: Optional[str] = None
    
    # Relationships
    client: "User" = Relationship(
        back_populates="bookings_as_client", 
        sa_relationship_kwargs={"foreign_keys": "[Booking.client_id]"}
    )
    provider: "User" = Relationship(
        back_populates="bookings_as_provider", 
        sa_relationship_kwargs={"foreign_keys": "[Booking.provider_id]"}
    )
    service: "Service" = Relationship(back_populates="bookings") 