# file: utils/auth.py
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings
from database import get_db
from sqlalchemy.orm import Session
import models
from utils.constants import ADMIN_ROLE

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def authenticate_admin(username: str, password: str, db: Session) -> Optional[models.AdminUser]:
    """Authenticate admin user against the database"""
    admin_user = db.query(models.AdminUser).filter(models.AdminUser.username == username).first()
    if admin_user and verify_password(password, admin_user.hashed_password):
        return admin_user
    return None

def get_current_admin_from_cookie(token: str = Cookie(None, alias="admin_token"), db: Session = Depends(get_db)) -> Dict[str, Any]:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated", headers={"WWW-Authenticate": "Bearer"})
    payload = verify_token(token)
    
    username = payload.get("username")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    admin_user = db.query(models.AdminUser).filter(models.AdminUser.username == username).first()
    if not admin_user or not admin_user.is_active:
        raise HTTPException(status_code=401, detail="Admin user not found or inactive")

    if payload.get("user_type") != ADMIN_ROLE:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return {"username": admin_user.username, "user_type": admin_user.role}

def create_admin_token(username: str) -> str:
    """Create a JWT token for admin user"""
    data = {
        "username": username,
        "user_type": ADMIN_ROLE,
        "iat": datetime.utcnow()
    }
    return create_access_token(data)
