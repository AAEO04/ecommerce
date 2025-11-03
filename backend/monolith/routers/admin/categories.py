from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import models
import schemas
from database import get_db
from utils import auth

router = APIRouter(prefix="/categories", tags=["Admin Categories"])

@router.get("/", response_model=List[schemas.CategoryResponse])
def get_admin_categories(
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get all categories"""

    query = db.query(models.Category)

    if not include_inactive:
        query = query.filter(models.Category.is_active == True)

    categories = query.all()
    return [schemas.CategoryResponse.from_orm(category) for category in categories]