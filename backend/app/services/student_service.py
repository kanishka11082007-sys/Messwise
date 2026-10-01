import random
from typing import Optional, List, Dict
from datetime import datetime, date, timezone
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.meal import MealSchedule, MealBooking, MealFeedback
from app.models.user import StudentProfile
from app.models.hostel import Hostel
from app.services.impact_service import impact_service
from app.schemas.student import (
    TodayMealsResponse,
    MealItemOut,
    ToggleBookingRequest,
    ToggleBookingResponse,
    FeedbackRequest,
    FeedbackResponse,
    BookingHistoryResponse,
    BookingHistoryItem,
    StudentImpactResponse
)


class StudentService:
    async def get_today_meals(self, db: AsyncSession, student_id: Optional[str] = None) -> TodayMealsResponse:
        today = date.today()

        stmt = select(MealSchedule).where(MealSchedule.date == today)
        result = await db.execute(stmt)
        schedules = result.scalars().all()

        bookings_map = {}
        if student_id:
            b_stmt = select(MealBooking).where(
                MealBooking.student_id == student_id,
                MealBooking.date == today
            )
            b_res = await db.execute(b_stmt)
            for b in b_res.scalars().all():
                bookings_map[b.meal_session.lower()] = b

        hostel_stmt = select(Hostel).limit(1)
        h_res = await db.execute(hostel_stmt)
        hostel = h_res.scalar_one_or_none()
        hostel_name = hostel.name if hostel else "Hostel A (Aryabhatta)"

        default_deadlines = {
            "breakfast": "6:30 AM",
            "lunch": "10:30 AM",
            "dinner": "5:30 PM"
        }

        meals_dict = {}
        if schedules:
            for sch in schedules:
                sess_key = sch.session.lower()
                b = bookings_map.get(sess_key)
                is_booked = (b.status == "Booked") if b else True
                token_val = b.token if (b and is_booked) else (f"TK-{sess_key[:3].upper()}-{random.randint(100, 999)}" if is_booked else None)

                meals_dict[sess_key] = MealItemOut(
                    session=sch.session,
                    menu=sch.menu,
                    time=sch.time_window,
                    booked=is_booked,
                    status="Booked" if is_booked else "Not Booked",
                    deadline=default_deadlines.get(sess_key, "10:30 AM"),
                    can_modify=True,
                    token=token_val
                )
        else:
            defaults = [
                ("breakfast", "Poha + Boiled Eggs / Banana + Milk", "7:00 AM - 9:00 AM", True, "TK-BKF-892", "6:30 AM"),
                ("lunch", "Rajma + Jeera Rice + Roti + Salad", "12:00 PM - 2:00 PM", True, "TK-LCH-419", "10:30 AM"),
                ("dinner", "Paneer Butter Masala + Roti + Dal", "7:00 PM - 9:00 PM", False, None, "5:30 PM")
            ]
            for sess_key, menu_str, time_str, default_booked, default_token, deadline_str in defaults:
                b = bookings_map.get(sess_key)
                is_booked = (b.status == "Booked") if b else default_booked
                token_val = b.token if (b and is_booked) else (default_token if is_booked else None)

                meals_dict[sess_key] = MealItemOut(
                    session=sess_key.capitalize(),
                    menu=menu_str,
                    time=time_str,
                    booked=is_booked,
                    status="Booked" if is_booked else "Not Booked",
                    deadline=deadline_str,
                    can_modify=True,
                    token=token_val
                )

        return TodayMealsResponse(
            date=today.strftime("%a, %d %b %Y"),
            hostel=hostel_name,
            meals=meals_dict
        )

    async def toggle_booking(
        self,
        db: AsyncSession,
        student_id: str,
        req: ToggleBookingRequest,
        student_name: str = "Nitin Sharma"
    ) -> ToggleBookingResponse:
        today = date.today()
        sess_clean = req.meal_session.lower()

        stmt = select(MealBooking).where(
            MealBooking.student_id == student_id,
            MealBooking.date == today,
            MealBooking.meal_session == sess_clean
        )
        res = await db.execute(stmt)
        booking = res.scalar_one_or_none()

        prof_stmt = select(StudentProfile).where(StudentProfile.id == student_id)
        prof_res = await db.execute(prof_stmt)
        student_profile = prof_res.scalar_one_or_none()

        if booking:
            now_booked = (booking.status != "Booked")
            booking.status = "Booked" if now_booked else "OptedOut"
            booking.token = f"TK-{sess_clean[:3].upper()}-{random.randint(100, 999)}" if now_booked else None
        else:
            now_booked = True
            booking = MealBooking(
                student_id=student_id,
                date=today,
                meal_session=sess_clean,
                status="Booked",
                token=f"TK-{sess_clean[:3].upper()}-{random.randint(100, 999)}",
                booked_at=datetime.now(timezone.utc)
            )
            db.add(booking)

        if student_profile:
            if now_booked:
                student_profile.meals_booked += 1
                student_profile.co2_avoided_kg = round(student_profile.co2_avoided_kg + 0.3, 1)
            else:
                student_profile.meals_saved += 1
                student_profile.co2_avoided_kg = round(student_profile.co2_avoided_kg + 0.5, 1)

        await db.commit()
        await db.refresh(booking)

        ev_type = "RSVP_CREATED" if now_booked else "RSVP_CANCELLED"
        ev_desc = (
            f"Meal RSVP confirmed for {sess_clean.capitalize()}."
            if now_booked
            else f"Timely cancellation submitted before deadline. 1 portion overproduction avoided."
        )

        await impact_service.record_event(
            db=db,
            event_type=ev_type,
            title=f"Student {student_name} {'booked' if now_booked else 'cancelled'} {sess_clean.capitalize()}",
            description=ev_desc,
            quantity=1,
            actor_role="student",
            actor_name=student_name,
            co2_saved_kg=0.5 if not now_booked else 0.3
        )

        booked_count = student_profile.meals_booked if student_profile else 82
        co2_val = student_profile.co2_avoided_kg if student_profile else 24.0

        return ToggleBookingResponse(
            meal_session=sess_clean,
            booked=now_booked,
            status="Booked" if now_booked else "OptedOut",
            token=booking.token,
            co2_avoided_kg=co2_val,
            meals_booked=booked_count,
            cancellation_recorded=not now_booked,
            message=f"{sess_clean.capitalize()} meal successfully {'booked' if now_booked else 'cancelled'}."
        )

    async def submit_feedback(
        self,
        db: AsyncSession,
        student_id: str,
        req: FeedbackRequest
    ) -> FeedbackResponse:
        fb = MealFeedback(
            student_id=student_id,
            meal_session=req.meal_session,
            rating=req.taste_rating,
            comment=req.comment,
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(fb)
        await db.commit()
        await db.refresh(fb)

        return FeedbackResponse(
            id=fb.id,
            message="Dining feedback submitted successfully. Thank you for helping optimize menu quality!",
            submitted_at=fb.submitted_at.isoformat()
        )

    async def get_booking_history(self, db: AsyncSession, student_id: str) -> BookingHistoryResponse:
        history_items = [
            BookingHistoryItem(id="b-01", date="16 Sep 2025", meal="Breakfast", item="Poha + Milk + Banana", status="Served", token="TK-BKF-892"),
            BookingHistoryItem(id="b-02", date="16 Sep 2025", meal="Lunch", item="Rajma + Jeera Rice + Roti", status="Booked", token="TK-LCH-419"),
            BookingHistoryItem(id="b-03", date="15 Sep 2025", meal="Dinner", item="Dal Tadka + Roti", status="Served", token="TK-DIN-502"),
            BookingHistoryItem(id="b-04", date="15 Sep 2025", meal="Lunch", item="Chole Bhature + Rice", status="Served", token="TK-LCH-381"),
            BookingHistoryItem(id="b-05", date="14 Sep 2025", meal="Dinner", item="Veg Pulao + Kadhi", status="Served", token="TK-DIN-114"),
        ]
        return BookingHistoryResponse(total=len(history_items), items=history_items)

    async def get_student_impact(self, db: AsyncSession, student_id: str) -> StudentImpactResponse:
        stmt = select(StudentProfile).where(StudentProfile.id == student_id)
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()

        name = profile.name if profile else "Nitin Sharma"
        hostel = "Hostel A (Aryabhatta)"
        booked = profile.meals_booked if profile else 82
        saved = profile.meals_saved if profile else 14
        co2 = profile.co2_avoided_kg if profile else 24.0
        rank_val = profile.rank if profile else 12

        return StudentImpactResponse(
            student_name=name,
            hostel=hostel,
            meals_booked=booked,
            meals_attended=max(0, booked - saved),
            timely_cancellations=saved,
            estimated_surplus_avoided_kg=round(float(saved) * 0.42, 1),
            co2_avoided_kg=co2,
            eco_rank=rank_val,
            sustainability_streak_days=18
        )


student_service = StudentService()
