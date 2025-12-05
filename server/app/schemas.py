# server/app/schemas.py
"""
Pydantic schemas for request/response validation.
Defines data models for users, jobs, and AI features.
"""
from datetime import datetime
from typing import Optional, Literal, Dict
from pydantic import BaseModel, EmailStr, Field


# =============================================================================
# User Schemas
# =============================================================================

class UserBase(BaseModel):
    """Base user schema with email."""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=6, max_length=72)


class UserLogin(UserBase):
    """Schema for user login."""
    password: str


class UserInDB(UserBase):
    """Internal user representation with hashed password."""
    id: str
    hashed_password: str


class UserOut(UserBase):
    """Public user information returned to frontend."""
    id: str
    name: Optional[str] = None


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded token payload data."""
    user_id: Optional[str] = None
    email: Optional[EmailStr] = None


# =============================================================================
# Password Reset Schemas
# =============================================================================

class ForgotPasswordRequest(BaseModel):
    """Request schema for forgot password."""
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    """Response schema for forgot password."""
    message: str


class ResetPasswordRequest(BaseModel):
    """Request schema for resetting password with token."""
    token: str
    new_password: str = Field(..., min_length=6, max_length=72)


class ResetPasswordResponse(BaseModel):
    """Response schema for password reset."""
    message: str


# =============================================================================
# Job Schemas
# =============================================================================

# Type definitions for job fields
JobStatus = Literal["applied", "interview", "rejected", "offer"]
JobPlatform = Literal["LinkedIn", "Indeed", "Glassdoor", "Company", "Other"]


class JobBase(BaseModel):
    """Base job schema with common fields."""
    company: str = Field(..., min_length=1, max_length=200)
    role: str = Field(..., min_length=1, max_length=200)
    job_link: str = Field(..., min_length=1)
    status: JobStatus = "applied"
    platform: JobPlatform = "LinkedIn"
    source: str = "manual"  # "manual" or "extension"
    notes: Optional[str] = Field(None, max_length=5000)
    resume_version: Optional[str] = Field(None, max_length=100)
    interview_date: Optional[datetime] = None
    interview_type: Optional[str] = Field(None, max_length=100)  # "phone", "video", "onsite"
    interview_notes: Optional[str] = Field(None, max_length=2000)
    reminder_sent: bool = False


class JobCreate(JobBase):
    """Schema for creating a new job application."""
    pass


class JobUpdate(BaseModel):
    """Schema for updating a job (all fields optional)."""
    company: Optional[str] = Field(None, min_length=1, max_length=200)
    role: Optional[str] = Field(None, min_length=1, max_length=200)
    job_link: Optional[str] = None
    status: Optional[JobStatus] = None
    platform: Optional[JobPlatform] = None
    notes: Optional[str] = Field(None, max_length=5000)
    resume_version: Optional[str] = Field(None, max_length=100)
    interview_date: Optional[datetime] = None
    interview_type: Optional[str] = Field(None, max_length=100)
    interview_notes: Optional[str] = Field(None, max_length=2000)
    reminder_sent: Optional[bool] = None


class JobOut(JobBase):
    """Schema for job output with all fields."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime


class StatsOut(BaseModel):
    """Statistics about user's job applications."""
    total_applications: int
    status_counts: Dict[str, int]
    platform_counts: Dict[str, int]


# =============================================================================
# AI Feature Schemas
# =============================================================================

class AISummarizeRequest(BaseModel):
    """Request schema for AI job description summarization."""
    job_description: str = Field(..., min_length=10)


class AISummarizeResponse(BaseModel):
    """Response schema for AI summarization."""
    summary: str


class AICompareRequest(BaseModel):
    """Request schema for AI resume comparison."""
    job_description: str = Field(..., min_length=10)
    resume_text: str = Field(..., min_length=10)


class AICompareResponse(BaseModel):
    """Response schema for AI resume comparison."""
    score: float = Field(..., ge=0, le=100)
    comment: str


# =============================================================================
# Calendar & Email Schemas
# =============================================================================

class InterviewEvent(BaseModel):
    """Schema for calendar interview events."""
    job_id: str
    company: str
    role: str
    interview_date: datetime
    interview_type: Optional[str] = None
    interview_notes: Optional[str] = None


class EmailReminderRequest(BaseModel):
    """Request schema for sending interview reminder."""
    job_id: str


class EmailReminderResponse(BaseModel):
    """Response schema for email reminder."""
    message: str
    sent_to: str


class CalendarEventsResponse(BaseModel):
    """Response schema for calendar events."""
    events: list[InterviewEvent]
