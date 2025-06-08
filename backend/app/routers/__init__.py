from .auth import router as auth_router
from .services import router as services_router
from .bookings import router as bookings_router
from .admin import router as admin_router

__all__ = ['auth_router', 'services_router', 'bookings_router', 'admin_router']
