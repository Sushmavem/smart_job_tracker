# server/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth_routes, jobs_routes, ai_routes, email_routes
from .database import get_db
from .config import settings


app = FastAPI(title="Job Tracker API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "chrome-extension://gedbkcoepgodcbklfjgcpmcgdagmgofh",  # extension can call backend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)

app.include_router(jobs_routes.router)
app.include_router(ai_routes.router)
app.include_router(email_routes.router)

@app.get("/")
async def root():
    return {"message": "Job Tracker API running"}
@app.get("/ping")
async def ping():
    return {"message": "pong"}
