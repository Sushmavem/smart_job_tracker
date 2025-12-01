from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str
    mongodb_db_name: str

    jwt_secret: str
    jwt_algorithm: str
    jwt_expires_minutes: int

    smtp_server: str
    smtp_port: int
    email_from: str
    email_password: str

    class Config:
        env_file = ".env"

settings = Settings()
