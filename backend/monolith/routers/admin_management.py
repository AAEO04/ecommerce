"""
Admin Management Router
Handles admin invites, password resets, and admin user management
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from models import AdminUser, AdminInvite, PasswordReset
from utils.auth import get_password_hash, get_current_admin_from_cookie
from utils.constants import ADMIN_ROLE
import secrets
import hashlib

router = APIRouter()

# ============================================================================
# MODELS
# ============================================================================

class InviteAdminRequest(BaseModel):
    email: EmailStr
    role: str = ADMIN_ROLE


class AcceptInviteRequest(BaseModel):
    token: str
    password: str


class RequestPasswordResetRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class AdminListResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def generate_secure_token() -> str:
    """Generate a cryptographically secure random token"""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Hash a token using SHA-256"""
    return hashlib.sha256(token.encode()).hexdigest()


def send_invite_email(email: str, token: str, invited_by: str):
    """
    Send invitation email to new admin
    TODO: Implement actual email sending
    """
    invite_link = f"http://localhost:3001/admin/accept-invite?token={token}"
    
    print(f"\n{'='*70}")
    print(f"📧 ADMIN INVITE EMAIL")
    print(f"{'='*70}")
    print(f"To: {email}")
    print(f"From: {invited_by}")
    print(f"Subject: You've been invited to join MAD RUSH Admin Panel")
    print(f"\nInvite Link: {invite_link}")
    print(f"\nThis link expires in 48 hours.")
    print(f"{'='*70}\n")
    
    # TODO: Replace with actual email service
    # await send_email(
    #     to=email,
    #     subject="You've been invited to join MAD RUSH Admin Panel",
    #     template="admin_invite",
    #     context={"invite_link": invite_link, "invited_by": invited_by}
    # )


def send_password_reset_email(email: str, token: str):
    """
    Send password reset email
    TODO: Implement actual email sending
    """
    reset_link = f"http://localhost:3001/admin/reset-password?token={token}"
    
    print(f"\n{'='*70}")
    print(f"📧 PASSWORD RESET EMAIL")
    print(f"{'='*70}")
    print(f"To: {email}")
    print(f"Subject: Reset Your MAD RUSH Admin Password")
    print(f"\nReset Link: {reset_link}")
    print(f"\nThis link expires in 1 hour.")
    print(f"If you didn't request this, please ignore this email.")
    print(f"{'='*70}\n")
    
    # TODO: Replace with actual email service


# ============================================================================
# ADMIN INVITE ENDPOINTS
# ============================================================================

@router.post("/invite")
def invite_admin(
    request: InviteAdminRequest,
    background_tasks: BackgroundTasks,
    current_admin: dict = Depends(get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """
    Invite a new admin user (requires existing admin authentication)
    Generates a secure one-time token and sends invitation email
    """
    # Check if email already exists as admin
    existing_admin = db.query(AdminUser).filter(
        AdminUser.email == request.email
    ).first()
    
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An admin with this email already exists"
        )
    
    # Check if there's already a pending invite
    existing_invite = db.query(AdminInvite).filter(
        AdminInvite.email == request.email,
        AdminInvite.is_used == False,
        AdminInvite.expires_at > datetime.utcnow()
    ).first()
    
    if existing_invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pending invitation already exists for this email"
        )
    
    # Get current admin ID
    current_admin_user = db.query(AdminUser).filter(
        AdminUser.email == current_admin["email"]
    ).first()
    
    # Generate secure token
    token = generate_secure_token()
    token_hash = hash_token(token)
    
    # Create invite record
    invite = AdminInvite(
        email=request.email,
        token_hash=token_hash,
        role=request.role,
        invited_by=current_admin_user.id,
        expires_at=datetime.utcnow() + timedelta(hours=48)  # 48 hour expiry
    )
    
    db.add(invite)
    db.commit()
    
    # Send invitation email in background
    background_tasks.add_task(
        send_invite_email,
        request.email,
        token,
        current_admin["email"]
    )
    
    return {
        "message": "Invitation sent successfully",
        "email": request.email,
        "expires_in_hours": 48
    }


@router.post("/accept-invite")
def accept_invite(request: AcceptInviteRequest, db: Session = Depends(get_db)):
    """
    Accept an admin invitation and create new admin account
    Validates token and creates admin user with provided password
    """
    # Hash the provided token
    token_hash = hash_token(request.token)
    
    # Find valid invite
    invite = db.query(AdminInvite).filter(
        AdminInvite.token_hash == token_hash,
        AdminInvite.is_used == False,
        AdminInvite.expires_at > datetime.utcnow()
    ).first()
    
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invitation token"
        )
    
    # Check if admin already exists (safety check)
    existing_admin = db.query(AdminUser).filter(
        AdminUser.email == invite.email
    ).first()
    
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin account already exists"
        )
    
    # Validate password strength (basic check)
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Create admin user
    admin_user = AdminUser(
        email=invite.email,
        hashed_password=get_password_hash(request.password),
        role=invite.role,
        is_active=True
    )
    
    db.add(admin_user)
    
    # Mark invite as used
    invite.is_used = True
    invite.used_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Admin account created successfully",
        "email": admin_user.email,
        "role": admin_user.role
    }


# ============================================================================
# PASSWORD RESET ENDPOINTS
# ============================================================================

@router.post("/forgot-password")
def request_password_reset(
    request: RequestPasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Request a password reset
    Always returns success (for security - don't reveal if email exists)
    """
    # Check if admin exists (silently)
    admin = db.query(AdminUser).filter(
        AdminUser.email == request.email
    ).first()
    
    if admin:
        # Invalidate any existing unused reset tokens for this email
        db.query(PasswordReset).filter(
            PasswordReset.email == request.email,
            PasswordReset.is_used == False
        ).update({"is_used": True})
        
        # Generate secure token
        token = generate_secure_token()
        token_hash = hash_token(token)
        
        # Create password reset record
        reset = PasswordReset(
            email=request.email,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
        )
        
        db.add(reset)
        db.commit()
        
        # Send reset email in background
        background_tasks.add_task(send_password_reset_email, request.email, token)
    
    # Always return success (security best practice)
    return {
        "message": "If an account exists with this email, a password reset link has been sent"
    }


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using valid token
    Validates token and updates admin password
    """
    # Hash the provided token
    token_hash = hash_token(request.token)
    
    # Find valid reset token
    reset = db.query(PasswordReset).filter(
        PasswordReset.token_hash == token_hash,
        PasswordReset.is_used == False,
        PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not reset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Find admin user
    admin = db.query(AdminUser).filter(
        AdminUser.email == reset.email
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Validate password strength
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Update password
    admin.hashed_password = get_password_hash(request.new_password)
    admin.updated_at = datetime.utcnow()
    
    # Mark reset token as used
    reset.is_used = True
    reset.used_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Password reset successfully"
    }


# ============================================================================
# ADMIN MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/admins", response_model=List[AdminListResponse])
def list_admins(
    current_admin: dict = Depends(get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """
    List all admin users (requires admin authentication)
    """
    admins = db.query(AdminUser).all()
    return admins


@router.patch("/admins/{admin_id}/deactivate")
def deactivate_admin(
    admin_id: int,
    current_admin: dict = Depends(get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """
    Deactivate an admin user (requires admin authentication)
    Cannot deactivate yourself
    """
    # Get current admin
    current_admin_user = db.query(AdminUser).filter(
        AdminUser.email == current_admin["email"]
    ).first()
    
    # Prevent self-deactivation
    if current_admin_user.id == admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    # Find target admin
    target_admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not target_admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Deactivate
    target_admin.is_active = False
    target_admin.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Admin user deactivated successfully",
        "admin_id": admin_id
    }


@router.patch("/admins/{admin_id}/activate")
def activate_admin(
    admin_id: int,
    current_admin: dict = Depends(get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """
    Activate an admin user (requires admin authentication)
    """
    # Find target admin
    target_admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not target_admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Activate
    target_admin.is_active = True
    target_admin.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Admin user activated successfully",
        "admin_id": admin_id
    }
