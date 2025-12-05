# server/app/deps.py
"""
Dependency injection for FastAPI routes.
Provides authentication and database access dependencies.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from .auth import decode_token
from .database import get_db
from .models import USERS_COLLECTION
from .schemas import TokenData

# OAuth2 scheme - uses the login endpoint for token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db=Depends(get_db)
) -> dict:
    """
    Validates JWT token and returns the current user data.

    Returns a dict with 'sub' (user_id) and 'email' keys to match
    what the routes expect.

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        user_id: str | None = payload.get("sub")
        email: str | None = payload.get("email")

        if user_id is None or email is None:
            raise credentials_exception

        token_data = TokenData(user_id=user_id, email=email)

    except (JWTError, Exception):
        raise credentials_exception

    # Verify user exists in database
    user = await db[USERS_COLLECTION].find_one({"_id": token_data.user_id})
    if user is None:
        raise credentials_exception

    # Return dict with 'sub' key to match what jobs_routes expects
    return {
        "sub": str(user["_id"]),
        "email": user["email"],
    }
