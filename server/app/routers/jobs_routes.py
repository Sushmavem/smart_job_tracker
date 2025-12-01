# server/app/routers/jobs_routes.py
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId

from ..database import get_db
from ..models import JOBS_COLLECTION
from ..schemas import JobCreate, JobUpdate, JobOut, StatsOut
from ..deps import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

def serialize_job(doc) -> JobOut:
    return JobOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        company=doc["company"],
        role=doc["role"],
        job_link=doc["job_link"],
        status=doc["status"],
        platform=doc["platform"],
        source=doc["source"],
        notes=doc.get("notes"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )

@router.post("/", response_model=JobOut)
async def create_job(
    job: JobCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    now = datetime.utcnow()
    doc = {
        "_id": str(ObjectId()),
        "user_id": current_user["id"],
        "company": job.company,
        "role": job.role,
        "job_link": job.job_link,
        "status": job.status,
        "platform": job.platform,
        "source": job.source,
        "notes": job.notes,
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
    query: dict = {"user_id": current_user["id"]}

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
    query = {"user_id": current_user["id"]}
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
        {"_id": job_id, "user_id": current_user["id"]}
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
    update_data = {k: v for k, v in job.dict(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()

    result = await db[JOBS_COLLECTION].find_one_and_update(
        {"_id": job_id, "user_id": current_user["id"]},
        {"$set": update_data},
        return_document=True,
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
        {"_id": job_id, "user_id": current_user["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"detail": "Deleted"}
