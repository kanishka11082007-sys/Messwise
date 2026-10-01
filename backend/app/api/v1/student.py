from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.services.student_service import student_service
from app.schemas.student import (
    TodayMealsResponse,
    ToggleBookingRequest,
    ToggleBookingResponse,
    FeedbackRequest,
    FeedbackResponse,
    BookingHistoryResponse,
    StudentImpactResponse
)

router = APIRouter(prefix="/student", tags=["Student Portal Operations"])


@router.get("/today-meals", response_model=TodayMealsResponse)
@router.get("/meals/today", response_model=TodayMealsResponse)
async def get_today_meals(
    current_user: User = Depends(require_role(["student"])),
    db: AsyncSession = Depends(get_db)
):
    student_id = current_user.student_profile.id if current_user.student_profile else None
    return await student_service.get_today_meals(db=db, student_id=student_id)


@router.post("/toggle-booking", response_model=ToggleBookingResponse)
@router.post("/meals/toggle", response_model=ToggleBookingResponse)
async def toggle_booking(
    req: ToggleBookingRequest,
    current_user: User = Depends(require_role(["student"])),
    db: AsyncSession = Depends(get_db)
):
    student_id = current_user.student_profile.id if current_user.student_profile else "usr-student-01"
    student_name = current_user.student_profile.name if current_user.student_profile else "Nitin Sharma"
    return await student_service.toggle_booking(db=db, student_id=student_id, req=req, student_name=student_name)


@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    req: FeedbackRequest,
    current_user: User = Depends(require_role(["student"])),
    db: AsyncSession = Depends(get_db)
):
    student_id = current_user.student_profile.id if current_user.student_profile else "usr-student-01"
    return await student_service.submit_feedback(db=db, student_id=student_id, req=req)


@router.get("/history", response_model=BookingHistoryResponse)
async def get_history(
    current_user: User = Depends(require_role(["student"])),
    db: AsyncSession = Depends(get_db)
):
    student_id = current_user.student_profile.id if current_user.student_profile else "usr-student-01"
    return await student_service.get_booking_history(db=db, student_id=student_id)


@router.get("/impact", response_model=StudentImpactResponse)
async def get_impact(
    current_user: User = Depends(require_role(["student"])),
    db: AsyncSession = Depends(get_db)
):
    student_id = current_user.student_profile.id if current_user.student_profile else "usr-student-01"
    return await student_service.get_student_impact(db=db, student_id=student_id)
