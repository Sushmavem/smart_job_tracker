# server/app/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client: AsyncIOMotorClient | None = None

def get_client() -> AsyncIOMotorClient:
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.mongodb_uri)
    return client

def get_db():
    mongo_client = get_client()
    return mongo_client[settings.mongodb_db_name]
