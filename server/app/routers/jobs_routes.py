# server/app/routers/jobs_routes.py
"""
Job management API routes.
Handles CRUD operations for job applications.
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from pymongo import ReturnDocument

from ..database import get_db
from ..models import JOBS_COLLECTION
from ..schemas import JobCreate, JobUpdate, JobOut, StatsOut
from ..deps import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])


def serialize_job(doc: dict) -> JobOut:
    """Convert MongoDB document to JobOut schema."""
    return JobOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        company=doc["company"],
        role=doc["role"],
        job_link=doc["job_link"],
        status=doc["status"],
        platform=doc["platform"],
        source=doc.get("source", "manual"),
        notes=doc.get("notes"),
        resume_version=doc.get("resume_version"),
        interview_date=doc.get("interview_date"),
        interview_type=doc.get("interview_type"),
        interview_notes=doc.get("interview_notes"),
        reminder_sent=doc.get("reminder_sent", False),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.post("/", response_model=JobOut)
async def create_job(
    job: JobCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create a new job application entry."""
    now = datetime.utcnow()
    doc = {
        "_id": str(ObjectId()),
        "user_id": current_user["sub"],
        "company": job.company,
        "role": job.role,
        "job_link": job.job_link,
        "status": job.status,
        "platform": job.platform,
        "source": job.source,
        "notes": job.notes,
        "resume_version": job.resume_version,
        "interview_date": job.interview_date,
        "interview_type": job.interview_type,
        "interview_notes": job.interview_notes,
        "reminder_sent": job.reminder_sent,
        "created_at": now,
        "updated_at": now,
    }
    await db[JOBS_COLLECTION].insert_one(doc)
    return serialize_job(doc)

@router.get("/", response_model=List[JobOut])
async def list_jobs(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    status: Optional[str] = None,
    platform: Optional[str] = None,
    company: Optional[str] = None,
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
):
    query: dict = {"user_id": current_user["sub"]}   # FIXED

    if status:
        query["status"] = status
    if platform:
        query["platform"] = platform
    if company:
        query["company"] = {"$regex": company, "$options": "i"}
    if date_from or date_to:
        created_filter = {}
        if date_from:
            created_filter["$gte"] = date_from
        if date_to:
            created_filter["$lte"] = date_to
        query["created_at"] = created_filter

    cursor = db[JOBS_COLLECTION].find(query).sort("created_at", -1)
    jobs = [serialize_job(doc) async for doc in cursor]
    return jobs

@router.get("/stats", response_model=StatsOut)
async def get_stats(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = {"user_id": current_user["sub"]}   # FIXED
    cursor = db[JOBS_COLLECTION].find(query)

    total = 0
    status_counts: dict[str, int] = {}
    platform_counts: dict[str, int] = {}

    async for doc in cursor:
        total += 1
        status_counts[doc["status"]] = status_counts.get(doc["status"], 0) + 1
        platform_counts[doc["platform"]] = platform_counts.get(doc["platform"], 0) + 1

    return StatsOut(
        total_applications=total,
        status_counts=status_counts,
        platform_counts=platform_counts,
    )

@router.get("/{job_id}", response_model=JobOut)
async def get_job(
    job_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    doc = await db[JOBS_COLLECTION].find_one(
        {"_id": job_id, "user_id": current_user["sub"]}   # FIXED
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    return serialize_job(doc)

@router.put("/{job_id}", response_model=JobOut)
async def update_job(
    job_id: str,
    job: JobUpdate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update an existing job application."""
    # Use model_dump (Pydantic v2) instead of deprecated dict()
    update_data = {k: v for k, v in job.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()

    result = await db[JOBS_COLLECTION].find_one_and_update(
        {"_id": job_id, "user_id": current_user["sub"]},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )

    if not result:
        raise HTTPException(status_code=404, detail="Job not found")

    return serialize_job(result)

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db[JOBS_COLLECTION].delete_one(
        {"_id": job_id, "user_id": current_user["sub"]}   # FIXED
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"detail": "Deleted"}


@router.get("/calendar/events")
async def get_calendar_events(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    month: Optional[int] = None,
    year: Optional[int] = None,
):
    """Get all jobs with interview dates for calendar view."""
    user_id = current_user["sub"]

    query = {
        "user_id": user_id,
        "interview_date": {"$ne": None}
    }

    # Filter by month/year if provided
    if month and year:
        from calendar import monthrange
        start_date = datetime(year, month, 1)
        _, last_day = monthrange(year, month)
        end_date = datetime(year, month, last_day, 23, 59, 59)
        query["interview_date"] = {
            "$gte": start_date,
            "$lte": end_date
        }

    cursor = db[JOBS_COLLECTION].find(query).sort("interview_date", 1)

    events = []
    async for doc in cursor:
        events.append({
            "id": doc["_id"],
            "job_id": doc["_id"],
            "company": doc["company"],
            "role": doc["role"],
            "interview_date": doc["interview_date"].isoformat() if doc.get("interview_date") else None,
            "interview_type": doc.get("interview_type"),
            "interview_notes": doc.get("interview_notes"),
            "status": doc["status"],
            "reminder_sent": doc.get("reminder_sent", False),
        })

    return {"events": events}
