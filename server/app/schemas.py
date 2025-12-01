# server/app/schemas.py
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field


# --- User schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72)


class UserLogin(UserBase):
    password: str

class UserInDB(UserBase):
    id: str
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[EmailStr] = None

# --- Job schemas ---
JobStatus = Literal["applied", "interview", "rejected", "offer"]
JobPlatform = Literal["LinkedIn", "Indeed", "Glassdoor", "Company", "Other"]

class JobBase(BaseModel):
    company: str
    role: str
    job_link: str
    status: JobStatus = "applied"
    platform: JobPlatform = "LinkedIn"
    source: str = "manual"  # or "extension"
    notes: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    job_link: Optional[str] = None
    status: Optional[JobStatus] = None
    platform: Optional[JobPlatform] = None
    notes: Optional[str] = None

class JobOut(JobBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

class StatsOut(BaseModel):
    total_applications: int
    status_counts: dict
    platform_counts: dict

# --- AI schemas ---
class AISummarizeRequest(BaseModel):
    job_description: str

class AISummarizeResponse(BaseModel):
    summary: str

class AICompareRequest(BaseModel):
    job_description: str
    resume_text: str

class AICompareResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    comment: str
