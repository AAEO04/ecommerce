# file: utils/auth.py
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import bcrypt
from fastapi import HTTPException, status, Depends, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings
from database import get_db
from sqlalchemy.orm import Session
import models
from utils.constants import ADMIN_ROLE

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        # Ensure password is bytes
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        # Ensure hash is bytes
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    try:
        # Ensure password is bytes and within bcrypt's 72 byte limit
        if isinstance(password, str):
            password = password.encode('utf-8')
        
        # Bcrypt has a 72 byte limit
        if len(password) > 72:
            password = password[:72]
        
        # Generate salt and hash
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password, salt)
        
        # Return as string for database storage
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise

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

def authenticate_admin(email: str, password: str, db: Session) -> Optional[models.AdminUser]:
    """Authenticate admin user against the database"""
    admin_user = db.query(models.AdminUser).filter(models.AdminUser.email == email).first()
    if admin_user and verify_password(password, admin_user.hashed_password):
        return admin_user
    return None

def get_current_admin_from_cookie(token: str = Cookie(None, alias="admin_token"), db: Session = Depends(get_db)) -> Dict[str, Any]:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated", headers={"WWW-Authenticate": "Bearer"})
    payload = verify_token(token)
    
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    admin_user = db.query(models.AdminUser).filter(models.AdminUser.email == email).first()
    if not admin_user or not admin_user.is_active:
        raise HTTPException(status_code=401, detail="Admin user not found or inactive")

    if payload.get("user_type") != ADMIN_ROLE:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return {"email": admin_user.email, "user_type": admin_user.role}

def create_admin_token(email: str) -> str:
    """Create a JWT token for admin user"""
    data = {
        "email": email,
        "user_type": ADMIN_ROLE,
        "iat": datetime.utcnow()
    }
    return create_access_token(data)

def get_current_admin_user(token: str = Cookie(None, alias="admin_token"), db: Session = Depends(get_db)) -> models.AdminUser:
    """
    Get current admin user from cookie and return AdminUser model instance.
    This is used by admin dashboard endpoints that need the full AdminUser object.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = verify_token(token)
    
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Query the admin user from database
    admin_user = db.query(models.AdminUser).filter(models.AdminUser.email == email).first()
    if not admin_user or not admin_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user not found or inactive"
        )
    
    # Verify user type is admin
    if payload.get("user_type") != ADMIN_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return admin_user
