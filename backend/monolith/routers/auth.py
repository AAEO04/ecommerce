# file: routers/auth.py
from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from pydantic import BaseModel
from typing import Optional
from utils.auth import authenticate_admin, create_admin_token, get_current_admin_from_cookie
from utils.rate_limiting import auth_rate_limit
from config import settings
from database import get_db
from sqlalchemy.orm import Session
from utils.constants import ADMIN_ROLE

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token_type: str = "bearer"
    expires_in: int

class AdminInfo(BaseModel):
    email: str
    user_type: str

@router.post("/login", response_model=LoginResponse)
@auth_rate_limit()
def admin_login(request: Request, login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate admin user and return JWT token in HttpOnly cookie"""
    
    # Validate credentials
    admin_user = authenticate_admin(login_data.email, login_data.password, db)
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create JWT token
    access_token = create_admin_token(admin_user.email)
    
    # Set HttpOnly cookie
    # Set HttpOnly cookie
    cookie_params = {
        "key": "admin_token",
        "value": access_token,
        "max_age": settings.COOKIE_MAX_AGE,
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": settings.COOKIE_SAMESITE,
        "path": "/"
    }
    if settings.COOKIE_DOMAIN:
        cookie_params["domain"] = settings.COOKIE_DOMAIN

    response.set_cookie(**cookie_params)
    
    return LoginResponse(
        token_type="bearer",
        expires_in=settings.COOKIE_MAX_AGE
    )

@router.get("/me", response_model=AdminInfo)
def get_admin_info(current_admin: dict = Depends(get_current_admin_from_cookie)):
    """Get current admin information"""
    return AdminInfo(
        email=current_admin["email"],
        user_type=ADMIN_ROLE
    )

@router.post("/logout")
def admin_logout(response: Response):
    """Logout admin user and clear HttpOnly cookie"""
    # Clear the HttpOnly cookie
    cookie_params = {
        "key": "admin_token",
        "path": "/",
        "samesite": settings.COOKIE_SAMESITE
    }
    if settings.COOKIE_DOMAIN:
        cookie_params["domain"] = settings.COOKIE_DOMAIN

    response.delete_cookie(**cookie_params)
    return {"message": "Successfully logged out"}

@router.get("/verify")
def verify_admin_token(current_admin: dict = Depends(get_current_admin_from_cookie)):
    """Verify if admin token is valid"""
    return {"valid": True, "admin": current_admin["email"]}
