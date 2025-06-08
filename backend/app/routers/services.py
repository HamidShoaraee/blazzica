from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Models
class ServiceBase(BaseModel):
    title: str
    description: str
    price: float
    category: str
    
class ServiceCreate(ServiceBase):
    pass
    
class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    
class ServiceResponse(ServiceBase):
    id: str
    provider_id: str
    is_active: bool
    
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

@router.get("/", response_model=List[ServiceResponse])
async def get_services(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_active: bool = True
):
    """Get all services with optional filtering"""
    supabase = get_supabase()
    
    # Start with a base query
    query = supabase.table("services").select("*").eq("is_active", is_active)
    
    # Apply filters if provided
    if category:
        query = query.eq("category", category)
    if min_price is not None:
        query = query.gte("price", min_price)
    if max_price is not None:
        query = query.lte("price", max_price)
    
    # Execute the query
    response = query.execute()
    
    if hasattr(response, 'data'):
        return response.data
    return []

@router.get("/providers", response_model=List[Dict[str, Any]])
async def get_providers_by_service(
    service: Optional[str] = None,
    category: Optional[str] = None
):
    """Get all providers that offer a specific service or category"""
    supabase = get_supabase()
    
    print(f"Searching for providers with service: {service}, category: {category}")
    
    # We need to find services that match the given service name and/or category
    services_query = supabase.table("services").select("*").eq("is_active", True)
    
    # Apply category filter if provided
    if category:
        services_query = services_query.eq("category", category)
    
    # Execute the query to get all active services (possibly filtered by category)
    services_response = services_query.execute()
    
    if not hasattr(services_response, 'data') or not services_response.data:
        print(f"No services found matching criteria")
        return []
    
    # If service name is provided, filter the results
    if service:
        print(f"Filtering services by name: {service}")
        # Case-insensitive match for service name
        filtered_services = [
            s for s in services_response.data 
            if s["title"].lower() == service.lower() or service.lower() in s["title"].lower()
        ]
        services_data = filtered_services
        print(f"Found {len(filtered_services)} services matching name")
    else:
        services_data = services_response.data
    
    print(f"Found {len(services_data)} matching services")
    
    # Get the unique provider IDs
    provider_ids = list(set([service["provider_id"] for service in services_data]))
    print(f"Found {len(provider_ids)} unique providers: {provider_ids}")
    
    # Now fetch provider profiles
    providers = []
    for provider_id in provider_ids:
        # Get user data
        user_response = supabase.table("users").select("*").eq("id", provider_id).single().execute()
        
        if not hasattr(user_response, 'data') or not user_response.data:
            print(f"No user data found for provider ID: {provider_id}")
            continue
        
        user_data = user_response.data
        print(f"Found user data for {user_data.get('full_name', 'unknown')}")
        
        # Get provider profile data
        profile_response = supabase.table("provider_profiles").select("*").eq("user_id", provider_id).single().execute()
        
        profile_data = {}
        if hasattr(profile_response, 'data') and profile_response.data:
            profile_data = profile_response.data
            print(f"Found profile data for provider ID: {provider_id}")
        else:
            print(f"No profile data found for provider ID: {provider_id}")
        
        # Get the services offered by this provider
        provider_services = [s for s in services_response.data if s["provider_id"] == provider_id]
        print(f"Provider offers {len(provider_services)} services")
        
        # Combine user data, profile data, and services
        provider_info = {
            **user_data,
            **profile_data,
            "services": provider_services
        }
        
        providers.append(provider_info)
    
    print(f"Returning {len(providers)} providers")
    return providers

@router.get("/provider/{provider_id}", response_model=List[ServiceResponse])
async def get_provider_services(
    provider_id: str,
    is_active: Optional[bool] = None
):
    """Get all services offered by a specific provider"""
    supabase = get_supabase()
    
    # Start with a base query
    query = supabase.table("services").select("*").eq("provider_id", provider_id)
    
    # Apply is_active filter if provided
    if is_active is not None:
        query = query.eq("is_active", is_active)
    
    # Execute the query
    response = query.execute()
    
    if hasattr(response, 'data'):
        return response.data
    return []

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: str):
    """Get a specific service by ID"""
    supabase = get_supabase()
    response = supabase.table("services").select("*").eq("id", service_id).single().execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return response.data

@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service: ServiceCreate,
    user = Depends(get_current_user)
):
    """Create a new service (Provider or Admin only)"""
    supabase = get_supabase()
    
    # Get user profile to check role
    user_response = supabase.table("users").select("*").eq("id", user.id).single().execute()
    
    if not hasattr(user_response, 'data') or not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_response.data
    
    # Only providers and admins can create services
    if user_data.get("role") not in ["provider", "admin"]:
        raise HTTPException(status_code=403, detail="Only providers and admins can create services")
    
    # Prepare service data
    service_data = service.dict()
    service_data["provider_id"] = user.id
    service_data["is_active"] = True
    
    # Create the service
    response = supabase.table("services").insert(service_data).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to create service")
    
    return response.data[0]

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    service: ServiceUpdate,
    user = Depends(get_current_user)
):
    """Update a service (Provider owner or Admin only)"""
    supabase = get_supabase()
    
    # Check if service exists
    service_response = supabase.table("services").select("*").eq("id", service_id).single().execute()
    
    if not hasattr(service_response, 'data') or not service_response.data:
        raise HTTPException(status_code=404, detail="Service not found")
    
    existing_service = service_response.data
    
    # Get user profile to check role
    user_response = supabase.table("users").select("*").eq("id", user.id).single().execute()
    
    if not hasattr(user_response, 'data') or not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_response.data
    
    # Check permissions - only the provider who created the service or admins can update it
    if user_data.get("role") != "admin" and existing_service.get("provider_id") != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this service")
    
    # Prepare update data - only include fields that are actually provided
    update_data = {k: v for k, v in service.dict().items() if v is not None}
    
    # Update the service
    response = supabase.table("services").update(update_data).eq("id", service_id).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=500, detail="Failed to update service")
    
    return response.data[0]

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: str,
    user = Depends(get_current_user)
):
    """Delete a service (Provider owner or Admin only)"""
    supabase = get_supabase()
    
    # Check if service exists
    service_response = supabase.table("services").select("*").eq("id", service_id).single().execute()
    
    if not hasattr(service_response, 'data') or not service_response.data:
        raise HTTPException(status_code=404, detail="Service not found")
    
    existing_service = service_response.data
    
    # Get user profile to check role
    user_response = supabase.table("users").select("*").eq("id", user.id).single().execute()
    
    if not hasattr(user_response, 'data') or not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_response.data
    
    # Check permissions - only the provider who created the service or admins can delete it
    if user_data.get("role") != "admin" and existing_service.get("provider_id") != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this service")
    
    # Delete the service
    supabase.table("services").delete().eq("id", service_id).execute()
    
    return None

@router.get("/by-title/{title}", response_model=Dict[str, Any])
async def get_service_by_title(title: str):
    """Get a specific service by title"""
    supabase = get_supabase()
    
    print(f"Searching for service with title: {title}")
    
    # Case-insensitive search for the service
    response = supabase.table("services").select("*").eq("is_active", True).execute()
    
    if not hasattr(response, 'data') or not response.data:
        raise HTTPException(status_code=404, detail="No services found")
    
    # Find the service with matching title (case-insensitive)
    service_data = None
    for service in response.data:
        if service["title"].lower() == title.lower():
            service_data = service
            break
    
    if not service_data:
        # Try partial matching if exact match not found
        for service in response.data:
            if title.lower() in service["title"].lower() or service["title"].lower() in title.lower():
                service_data = service
                break
    
    if not service_data:
        raise HTTPException(status_code=404, detail=f"Service with title '{title}' not found")
    
    print(f"Found service: {service_data['title']}, Category: {service_data['category']}")
    
    # Get the min and max price across all similar services in the same category
    category_services = [
        s for s in response.data 
        if s["category"] == service_data["category"]
    ]
    
    min_price = min([s["price"] for s in category_services]) if category_services else service_data["price"]
    max_price = max([s["price"] for s in category_services]) if category_services else service_data["price"]
    
    # Return the service with additional min/max price data
    return {
        **service_data,
        "minPrice": min_price,
        "maxPrice": max_price
    }