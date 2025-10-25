# file: routers/auth.py
from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from fastapi.security import HTTPBearer, HTTPCookie
from pydantic import BaseModel
from typing import Optional
from utils.auth import authenticate_admin, create_admin_token, get_current_admin, get_current_admin_from_cookie
from utils.rate_limiting import auth_rate_limit
from config import settings

router = APIRouter()
security = HTTPBearer()
cookie_auth = HTTPCookie(name="admin_token")

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class AdminInfo(BaseModel):
    username: str
    user_type: str

@router.post("/login", response_model=LoginResponse)
@auth_rate_limit()
def admin_login(login_data: LoginRequest, response: Response):
    """Authenticate admin user and return JWT token in HttpOnly cookie"""
    
    # Validate credentials
    if not authenticate_admin(login_data.username, login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create JWT token
    access_token = create_admin_token(login_data.username)
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="admin_token",
        value=access_token,
        max_age=settings.COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/"
    )
    
    return LoginResponse(
        access_token="",  # Don't return token in response body
        token_type="bearer",
        expires_in=settings.COOKIE_MAX_AGE
    )

@router.get("/me", response_model=AdminInfo)
def get_admin_info(current_admin: dict = Depends(get_current_admin_from_cookie)):
    """Get current admin information"""
    return AdminInfo(
        username=current_admin["username"],
        user_type=current_admin["user_type"]
    )

@router.post("/logout")
def admin_logout(response: Response):
    """Logout admin user and clear HttpOnly cookie"""
    # Clear the HttpOnly cookie
    response.delete_cookie(
        key="admin_token",
        path="/",
        samesite=settings.COOKIE_SAMESITE
    )
    return {"message": "Successfully logged out"}

@router.post("/verify")
def verify_admin_token(current_admin: dict = Depends(get_current_admin_from_cookie)):
    """Verify if admin token is valid"""
    return {"valid": True, "admin": current_admin["username"]}
