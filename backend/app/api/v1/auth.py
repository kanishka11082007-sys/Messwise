from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    StudentLoginRequest,
    AdminLoginRequest,
    NgoLoginRequest,
    LoginRequest,
    TokenResponse
)
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/student/login", response_model=TokenResponse)
async def student_login(req: StudentLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.login_student(
        db=db,
        enrollment_no=req.enrollment_no,
        father_name=req.father_name
    )
    return result


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(req: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.login_admin(
        db=db,
        username=req.username,
        password=req.password
    )
    return result


@router.post("/ngo/login", response_model=TokenResponse)
async def ngo_login(req: NgoLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.login_ngo(
        db=db,
        email=req.email,
        password=req.password
    )
    return result


@router.post("/login", response_model=TokenResponse)
async def unified_login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await auth_service.authenticate_user(
        db=db,
        email=req.email,
        password=req.password,
        role_hint=req.role,
        enrollment_no=req.enrollment_no,
        father_name=req.father_name,
        username=req.username
    )
    return result


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile = await auth_service.get_user_profile(db=db, user=current_user)
    return profile


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
