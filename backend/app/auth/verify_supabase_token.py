import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import requests
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Cache the public key
_jwks = None

async def get_jwks():
    global _jwks
    if _jwks is None:
        jwks_url = f"{SUPABASE_URL}/auth/v1/jwks"
        response = requests.get(jwks_url)
        _jwks = response.json()
    return _jwks

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    
    try:
        # Decode the JWT header to get the key ID (kid)
        jwt_header = jwt.get_unverified_header(token)
        kid = jwt_header.get("kid")
        
        # Get the JWKS
        jwks = await get_jwks()
        
        # Find the signing key that matches the kid in the JWT header
        signing_key = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                signing_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
        
        if not signing_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience="authenticated",
            options={"verify_exp": True},
        )
        
        # Extract user information
        user = {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "user"),
        }
        
        return user
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )

# Role-based access control decorator
def RoleChecker(allowed_roles: list):
    def check_role(user = Depends(get_current_user)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return user
    return check_role 