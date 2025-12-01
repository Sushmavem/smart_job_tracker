# server/app/routers/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from ..database import get_db
from ..models import USERS_COLLECTION
from ..schemas import UserCreate, UserLogin, Token
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

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

