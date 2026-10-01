from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User, StudentProfile, AdminProfile, NgoProfile
from app.models.hostel import Hostel
from app.schemas.auth import UserPreferencesUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }

    if current_user.role == "student":
        sp_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
        sp = sp_res.scalar_one_or_none()
        if sp:
            hostel_name = "Hostel A (Aryabhatta)"
            if sp.hostel_id:
                h_res = await db.execute(select(Hostel).where(Hostel.id == sp.hostel_id))
                h = h_res.scalar_one_or_none()
                if h:
                    hostel_name = h.name

            data.update({
                "name": sp.name,
                "roll_no": sp.roll_no,
                "hostel": hostel_name,
                "room": sp.room,
                "diet": sp.diet,
                "meals_booked": sp.meals_booked,
                "meals_saved": sp.meals_saved,
                "co2_avoided_kg": sp.co2_avoided_kg,
                "eco_rank": sp.rank,
                "notifications_enabled": sp.notifications
            })

    elif current_user.role == "admin":
        ap_res = await db.execute(select(AdminProfile).where(AdminProfile.user_id == current_user.id))
        ap = ap_res.scalar_one_or_none()
        if ap:
            data.update({
                "name": ap.name,
                "phone": ap.phone
            })

    elif current_user.role == "ngo":
        np_res = await db.execute(select(NgoProfile).where(NgoProfile.user_id == current_user.id))
        np = np_res.scalar_one_or_none()
        if np:
            data.update({
                "name": np.name,
                "contact_person": np.contact_person,
                "phone": np.phone,
                "total_meals_rescued": np.total_meals_rescued,
                "people_served": np.people_served,
                "co2_diverted_kg": np.co2_diverted_kg
            })

    return data


@router.patch("/me/preferences")
async def update_preferences(
    req: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role == "student":
        sp_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
        sp = sp_res.scalar_one_or_none()
        if sp:
            if req.diet is not None:
                sp.diet = req.diet
            if req.notifications_enabled is not None:
                sp.notifications = req.notifications_enabled
            await db.commit()
            return {"message": "Preferences updated successfully", "diet": sp.diet, "notifications_enabled": sp.notifications}

    return {"message": "Preferences updated"}
