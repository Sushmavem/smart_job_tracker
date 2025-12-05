# server/app/routers/email_routes.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..config import settings
from ..deps import get_current_user
from ..database import get_db
from ..models import JOBS_COLLECTION
from ..schemas import EmailReminderRequest, EmailReminderResponse

router = APIRouter(prefix="/email", tags=["email"])


class EmailRequest(BaseModel):
    to_email: str
    subject: str
    body: str


def send_email_smtp(to_email: str, subject: str, body: str, html_body: str = None):
    """Send email via SMTP with optional HTML body."""
    try:
        if html_body:
            msg = MIMEMultipart("alternative")
            msg.attach(MIMEText(body, "plain"))
            msg.attach(MIMEText(html_body, "html"))
        else:
            msg = MIMEText(body)

        msg["Subject"] = subject
        msg["From"] = settings.email_from
        msg["To"] = to_email

        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.email_from, settings.email_password)
            server.sendmail(settings.email_from, [to_email], msg.as_string())

        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False


@router.post("/send")
async def send_email(
    req: EmailRequest,
    current_user=Depends(get_current_user),
):
    """Send a custom email."""
    success = send_email_smtp(req.to_email, req.subject, req.body)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    return {"detail": "Email sent"}


@router.post("/send-reminder", response_model=EmailReminderResponse)
async def send_interview_reminder(
    req: EmailReminderRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Send an interview reminder email for a specific job."""
    user_id = current_user["sub"]
    user_email = current_user["email"]

    # Get the job
    job = await db[JOBS_COLLECTION].find_one({
        "_id": req.job_id,
        "user_id": user_id
    })

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if not job.get("interview_date"):
        raise HTTPException(status_code=400, detail="No interview scheduled for this job")

    interview_date = job["interview_date"]
    if isinstance(interview_date, str):
        interview_date = datetime.fromisoformat(interview_date.replace("Z", "+00:00"))

    # Format the date nicely
    formatted_date = interview_date.strftime("%A, %B %d, %Y at %I:%M %p")
    interview_type = job.get("interview_type", "Interview")

    # Create email content
    subject = f"Interview Reminder: {job['role']} at {job['company']}"

    body = f"""
Interview Reminder

You have an upcoming interview scheduled:

Company: {job['company']}
Position: {job['role']}
Date & Time: {formatted_date}
Type: {interview_type}

Job Posting: {job['job_link']}

{f"Notes: {job.get('interview_notes', '')}" if job.get('interview_notes') else ""}

Good luck with your interview!

- Job Tracker
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
        .detail {{ background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }}
        .label {{ color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }}
        .value {{ font-size: 16px; font-weight: 600; color: #333; }}
        .btn {{ display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">Interview Reminder</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Don't forget your upcoming interview!</p>
        </div>
        <div class="content">
            <div class="detail">
                <div class="label">Company</div>
                <div class="value">{job['company']}</div>
            </div>
            <div class="detail">
                <div class="label">Position</div>
                <div class="value">{job['role']}</div>
            </div>
            <div class="detail">
                <div class="label">Date & Time</div>
                <div class="value">{formatted_date}</div>
            </div>
            <div class="detail">
                <div class="label">Interview Type</div>
                <div class="value">{interview_type}</div>
            </div>
            {f'<div class="detail"><div class="label">Notes</div><div class="value">{job.get("interview_notes", "")}</div></div>' if job.get('interview_notes') else ''}
            <a href="{job['job_link']}" class="btn">View Job Posting</a>
            <div class="footer">
                <p>Good luck with your interview!</p>
                <p>Sent by Job Tracker</p>
            </div>
        </div>
    </div>
</body>
</html>
"""

    success = send_email_smtp(user_email, subject, body, html_body)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send reminder email")

    # Mark reminder as sent
    await db[JOBS_COLLECTION].update_one(
        {"_id": req.job_id},
        {"$set": {"reminder_sent": True}}
    )

    return {
        "message": f"Interview reminder sent for {job['company']} - {job['role']}",
        "sent_to": user_email
    }


@router.get("/upcoming-interviews")
async def get_upcoming_interviews(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Get all jobs with upcoming interviews in the next 7 days."""
    user_id = current_user["sub"]
    now = datetime.utcnow()
    week_from_now = now + timedelta(days=7)

    jobs = await db[JOBS_COLLECTION].find({
        "user_id": user_id,
        "interview_date": {
            "$gte": now,
            "$lte": week_from_now
        }
    }).sort("interview_date", 1).to_list(100)

    # Convert ObjectId and dates
    for job in jobs:
        job["id"] = job.pop("_id")
        if job.get("interview_date"):
            job["interview_date"] = job["interview_date"].isoformat()

    return {"upcoming_interviews": jobs}
