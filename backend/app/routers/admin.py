from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Router
router = APIRouter()
security = HTTPBearer()

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def admin_required(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Check if user is admin"""
    supabase = get_supabase()
    
    try:
        # Verify token
        user = supabase.auth.get_user(credentials.credentials)
        
        # Get user profile
        response = supabase.table("users").select("*").eq("id", user.user.id).single().execute()
        
        if not hasattr(response, 'data') or not response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        if response.data.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@router.get("/")
async def admin_root(admin = Depends(admin_required)):
    return {"message": "Admin endpoints"}

@router.get("/users")
async def get_all_users(
    role: Optional[str] = None,
    is_verified: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    admin = Depends(admin_required)
):
    """Get all users with optional filtering"""
    supabase = get_supabase()
    
    query = supabase.table("users").select("*")
    
    if role:
        query = query.eq("role", role)
    if is_verified is not None:
        query = query.eq("is_verified", is_verified)
    
    query = query.range(skip, skip + limit - 1)
    response = query.execute()
    
    if not hasattr(response, 'data'):
        return []
    
    return response.data

@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    admin = Depends(admin_required)
):
    """Get a specific user by ID"""
    supabase = get_supabase()
    
    response = supabase.table("users").select("*").eq("id", user_id).single().execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return response.data

@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_data: dict,
    admin = Depends(admin_required)
):
    """Update a user (Admin only)"""
    supabase = get_supabase()
    
    # Check if user exists
    user_check = supabase.table("users").select("*").eq("id", user_id).single().execute()
    
    if not hasattr(user_check, 'data') or not user_check.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user
    response = supabase.table("users").update(user_data).eq("id", user_id).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to update user")
    
    return response.data[0]

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    admin = Depends(admin_required)
):
    """Update a user's role (Admin only)"""
    supabase = get_supabase()
    
    # Check if user exists
    user_check = supabase.table("users").select("*").eq("id", user_id).single().execute()
    
    if not hasattr(user_check, 'data') or not user_check.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update role
    response = supabase.table("users").update({"role": role}).eq("id", user_id).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to update user role")
    
    return response.data[0]

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    admin = Depends(admin_required)
):
    """Get admin dashboard statistics"""
    supabase = get_supabase()
    
    # Count users by role
    all_users = supabase.table("users").select("*").execute()
    users_data = all_users.data if hasattr(all_users, 'data') else []
    
    # Process users data
    total_users = len(users_data)
    clients = sum(1 for u in users_data if u.get("role") == "client")
    providers = sum(1 for u in users_data if u.get("role") == "provider")
    admins = sum(1 for u in users_data if u.get("role") == "admin")
    
    # Count services
    all_services = supabase.table("services").select("*").execute()
    services_data = all_services.data if hasattr(all_services, 'data') else []
    
    total_services = len(services_data)
    active_services = sum(1 for s in services_data if s.get("is_active") == True)
    
    # Count bookings
    all_bookings = supabase.table("bookings").select("*").execute()
    bookings_data = all_bookings.data if hasattr(all_bookings, 'data') else []
    
    total_bookings = len(bookings_data)
    pending_bookings = sum(1 for b in bookings_data if b.get("status") == "pending")
    confirmed_bookings = sum(1 for b in bookings_data if b.get("status") == "confirmed")
    completed_bookings = sum(1 for b in bookings_data if b.get("status") == "completed")
    cancelled_bookings = sum(1 for b in bookings_data if b.get("status") == "cancelled")
    
    # Payment statistics
    paid_bookings = sum(1 for b in bookings_data if b.get("payment_status") == "paid")
    total_revenue = sum(b.get("total_price", 0) for b in bookings_data if b.get("payment_status") == "paid")
    
    return {
        "users": {
            "total": total_users,
            "clients": clients,
            "providers": providers,
            "admins": admins
        },
        "services": {
            "total": total_services,
            "active": active_services
        },
        "bookings": {
            "total": total_bookings,
            "pending": pending_bookings,
            "confirmed": confirmed_bookings,
            "completed": completed_bookings,
            "cancelled": cancelled_bookings
        },
        "payments": {
            "paid_bookings": paid_bookings,
            "total_revenue": total_revenue
        }
    } 