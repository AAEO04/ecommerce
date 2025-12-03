# file: config.py
import os
from typing import Optional, List

class Settings:
    # Database - REQUIRED
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("Warning: DATABASE_URL environment variable is not set. Using in-memory SQLite for now.")
        DATABASE_URL = "sqlite:///./test.db"
    
    # Redis (optional for caching)
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    
    # Payment (Paystack) - REQUIRED for production
    PAYSTACK_SECRET_KEY: str = os.getenv("PAYSTACK_SECRET_KEY", "")
    PAYSTACK_PUBLIC_KEY: str = os.getenv("PAYSTACK_PUBLIC_KEY", "")
    PAYMENT_MODE: str = os.getenv("PAYMENT_MODE", "production")
    
    # Mailgun Configuration
    MAILGUN_API_KEY: str = os.getenv("MAILGUN_API_KEY", "")
    MAILGUN_DOMAIN: str = os.getenv("MAILGUN_DOMAIN", "")
    MAILGUN_REGION: str = os.getenv("MAILGUN_REGION", "us")  # 'us' or 'eu'
    SENDER_NAME: str = os.getenv("SENDER_NAME", "MAD RUSH")

    # Email (SMTP)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "noreply@Madrush.com.ng")
    NOTIFICATION_MOCK: bool = os.getenv("NOTIFICATION_MOCK", "false").lower() == "true"
    
    # WhatsApp (Meta Cloud API - optional)
    META_ACCESS_TOKEN: str = os.getenv("META_ACCESS_TOKEN", "")
    META_PHONE_NUMBER_ID: str = os.getenv("META_PHONE_NUMBER_ID", "")
    META_API_VERSION: str = os.getenv("META_API_VERSION", "v18.0")
    
    # JWT Secret - REQUIRED
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    if not JWT_SECRET_KEY:
        raise ValueError("FATAL: JWT_SECRET_KEY environment variable is not set.")
    if len(JWT_SECRET_KEY) < 32:
        raise ValueError("FATAL: JWT_SECRET_KEY must be at least 32 characters for security.")
    
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS Origins - REQUIRED
    CORS_ORIGINS: List[str] = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")]
    
    # Cookie Configuration
    # Default to False for local dev, True for production
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")  # 'strict' breaks some flows
    COOKIE_MAX_AGE: int = int(os.getenv("COOKIE_MAX_AGE", "1800"))
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

settings = Settings()