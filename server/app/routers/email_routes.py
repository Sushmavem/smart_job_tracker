# server/app/routers/email_routes.py
import smtplib
from email.mime.text import MIMEText

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..config import settings
from ..deps import get_current_user

router = APIRouter(prefix="/email", tags=["email"])

class EmailRequest(BaseModel):
    to_email: str
    subject: str
    body: str

@router.post("/send")
async def send_email(
    req: EmailRequest,
    current_user=Depends(get_current_user),
):
    msg = MIMEText(req.body)
    msg["Subject"] = req.subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = req.to_email

    with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.EMAIL_FROM, settings.EMAIL_PASSWORD)
        server.sendmail(settings.EMAIL_FROM, [req.to_email], msg.as_string())

    return {"detail": "Email sent"}
