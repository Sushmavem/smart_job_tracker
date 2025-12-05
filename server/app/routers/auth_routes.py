# server/app/routers/auth_routes.py
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from ..database import get_db
from ..models import USERS_COLLECTION
from ..schemas import (
    UserCreate, UserLogin, Token,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse
)
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

# Collection for password reset tokens
RESET_TOKENS_COLLECTION = "reset_tokens"

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db=Depends(get_db)):
    existing = await db[USERS_COLLECTION].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "_id": str(ObjectId()),
        "email": user.email,
        "hashed_password": hash_password(user.password),
    }
    await db[USERS_COLLECTION].insert_one(user_doc)

    token = create_access_token({"sub": user_doc["_id"], "email": user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(user: UserLogin, db=Depends(get_db)):
    doc = await db[USERS_COLLECTION].find_one({"email": user.email})
    if not doc or not verify_password(user.password, doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    token = create_access_token({"sub": doc["_id"], "email": doc["email"]})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest, db=Depends(get_db)):
    """
    Request a password reset. Generates a reset token and returns it.
    In production, this would send an email with a reset link.
    """
    # Check if user exists
    user = await db[USERS_COLLECTION].find_one({"email": request.email})

    # Always return success to prevent email enumeration attacks
    if not user:
        return {"message": "If an account exists with this email, a reset link has been sent."}

    # Generate a secure reset token
    reset_token = secrets.token_urlsafe(32)

    # Store the token with expiration (1 hour)
    token_doc = {
        "_id": str(ObjectId()),
        "user_id": user["_id"],
        "email": request.email,
        "token": reset_token,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(hours=1),
        "used": False
    }

    # Remove any existing reset tokens for this user
    await db[RESET_TOKENS_COLLECTION].delete_many({"user_id": user["_id"]})

    # Insert new token
    await db[RESET_TOKENS_COLLECTION].insert_one(token_doc)

    # In a real app, send email here. For now, we'll include the token in response
    # so the frontend can handle it (for demo purposes)
    return {
        "message": f"Password reset token generated. Use this token to reset your password: {reset_token}"
    }


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(request: ResetPasswordRequest, db=Depends(get_db)):
    """
    Reset password using the token from forgot-password endpoint.
    """
    # Find the reset token
    token_doc = await db[RESET_TOKENS_COLLECTION].find_one({
        "token": request.token,
        "used": False
    })

    if not token_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Check if token has expired
    if datetime.utcnow() > token_doc["expires_at"]:
        # Mark token as used
        await db[RESET_TOKENS_COLLECTION].update_one(
            {"_id": token_doc["_id"]},
            {"$set": {"used": True}}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one."
        )

    # Update the user's password
    new_hashed_password = hash_password(request.new_password)
    await db[USERS_COLLECTION].update_one(
        {"_id": token_doc["user_id"]},
        {"$set": {"hashed_password": new_hashed_password}}
    )

    # Mark the token as used
    await db[RESET_TOKENS_COLLECTION].update_one(
        {"_id": token_doc["_id"]},
        {"$set": {"used": True}}
    )

    return {"message": "Password has been reset successfully. You can now log in with your new password."}

