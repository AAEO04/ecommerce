import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List
from utils import auth

router = APIRouter(prefix="/upload-image", tags=["Admin Uploads"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    current_admin: dict = Depends(auth.get_current_admin_from_cookie)
):
    """Upload an image file"""
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return URL (assuming static mount at /static)
    # In production, this should be a full URL or CDN URL
    image_url = f"/static/uploads/{filename}"
    
    return {"image_url": image_url}
