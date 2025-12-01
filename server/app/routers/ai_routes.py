# server/app/routers/ai_routes.py
from fastapi import APIRouter
from ..schemas import (
    AISummarizeRequest,
    AISummarizeResponse,
    AICompareRequest,
    AICompareResponse,
)

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/summarize", response_model=AISummarizeResponse)
async def summarize_job(req: AISummarizeRequest):
    # Simple fake summary. Later: integrate OpenAI/Gemini etc.
    text = req.job_description
    short = text[:300] + ("..." if len(text) > 300 else "")
    return AISummarizeResponse(summary=short)

@router.post("/compare", response_model=AICompareResponse)
async def compare(req: AICompareRequest):
    # Very naive "score" based on overlapping words
    jd_words = set(req.job_description.lower().split())
    cv_words = set(req.resume_text.lower().split())
    overlap = len(jd_words & cv_words)
    total = len(jd_words) or 1
    score = min(100.0, (overlap / total) * 100 * 2)  # rough
    return AICompareResponse(
        score=round(score, 1),
        comment="Rough overlap-based score. Integrate real AI for production."
    )
