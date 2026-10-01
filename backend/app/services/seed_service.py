import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, StudentProfile, AdminProfile, NgoProfile
from app.models.hostel import Hostel
from app.models.meal import MealSchedule, MealBooking, MealFeedback, DailyProductionLog
from app.models.surplus import SurplusListing, SurplusRequest, DistributionRecord
from app.models.waste import WasteRecord
from app.models.demand import NgoDemand
from app.models.impact import ImpactEvent
from app.core.security import get_password_hash


async def seed_initial_data(db: AsyncSession):
    # Check if data already seeded
    existing_user = await db.execute(select(User).limit(1))
    if existing_user.scalar_one_or_none() is not None:
        return

    # 1. Create Default Hostel
    hostel_a = Hostel(
        id="h-hostel-a",
        name="Hostel A - Aryabhatta Central Mess",
        campus_block="North Campus, Block A",
        enrolled_boarders=650,
        capacity=800
    )
    db.add(hostel_a)
    await db.flush()

    # 2. Create Users & Profiles
    # 2a. Student User (Nitin Sharma)
    student_user = User(
        id="usr-student-01",
        username="2022CSB042",
        email="nitin.sharma@campus.edu",
        hashed_password=get_password_hash("student123"),
        role="student",
        is_active=True
    )
    db.add(student_user)
    await db.flush()

    student_profile = StudentProfile(
        id="sp-student-01",
        user_id=student_user.id,
        name="Nitin Sharma",
        roll_no="2022CSB042",
        enrollment_no="2022CSB042",
        father_name_hash=get_password_hash("Ramesh Sharma"),
        hostel_id=hostel_a.id,
        room="B-304",
        avatar="👨‍🎓",
        diet="Vegetarian",
        meals_booked=82,
        meals_saved=14,
        co2_avoided_kg=24.0,
        rank=12,
        notifications=True
    )
    db.add(student_profile)

    # 2b. Mess Admin User (Rajesh Kumar)
    admin_user = User(
        id="usr-admin-01",
        username="admin",
        email="admin@campus.edu",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True
    )
    db.add(admin_user)
    await db.flush()

    admin_profile = AdminProfile(
        id="ap-admin-01",
        user_id=admin_user.id,
        name="Rajesh Kumar",
        username="admin",
        hostel_id=hostel_a.id,
        phone="+91 98110 44321"
    )
    db.add(admin_profile)

    # 2c. NGO User (Helping Hands NGO)
    ngo_user = User(
        id="usr-ngo-01",
        username="helpinghands",
        email="helpinghands@ngo.org",
        hashed_password=get_password_hash("ngo123"),
        role="ngo",
        is_active=True
    )
    db.add(ngo_user)
    await db.flush()

    ngo_profile = NgoProfile(
        id="ngo-helping-hands",
        user_id=ngo_user.id,
        name="Helping Hands NGO",
        organization_name="Helping Hands NGO",
        tagline="Together we can eliminate hunger",
        contact_person="Dr. Sunita Rao",
        phone="+91 98450 12345",
        fssai_verified=True,
        total_meals_rescued=4320,
        people_served=4190,
        co2_diverted_kg=648.0
    )
    db.add(ngo_profile)
    await db.flush()

    # 3. Create Today's Meal Schedules
    today = datetime.date.today()
    s_bkf = MealSchedule(
        id="sched-bkf-today",
        hostel_id=hostel_a.id,
        date=today,
        session="breakfast",
        menu="Poha + Milk + Banana",
        time_window="7:00 AM - 9:00 AM"
    )
    s_lch = MealSchedule(
        id="sched-lch-today",
        hostel_id=hostel_a.id,
        date=today,
        session="lunch",
        menu="Rajma + Jeera Rice + Roti + Salad",
        time_window="12:00 PM - 2:00 PM"
    )
    s_din = MealSchedule(
        id="sched-din-today",
        hostel_id=hostel_a.id,
        date=today,
        session="dinner",
        menu="Paneer Butter Masala + Roti + Dal",
        time_window="7:00 PM - 9:00 PM"
    )
    db.add_all([s_bkf, s_lch, s_din])
    await db.flush()

    # 4. Create Today's Student Bookings
    b_bkf = MealBooking(
        id="b-bkf-01",
        student_id=student_profile.id,
        schedule_id=s_bkf.id,
        date=today,
        meal_session="breakfast",
        item_summary="Poha + Milk + Banana",
        status="Booked",
        token="BKF-892"
    )
    b_lch = MealBooking(
        id="b-lch-01",
        student_id=student_profile.id,
        schedule_id=s_lch.id,
        date=today,
        meal_session="lunch",
        item_summary="Rajma + Jeera Rice + Roti + Salad",
        status="Booked",
        token="LCH-419"
    )
    db.add_all([b_bkf, b_lch])

    # 5. Production Log
    prod_log = DailyProductionLog(
        id="prod-01",
        hostel_id=hostel_a.id,
        date=today,
        meal_session="Lunch",
        prepared_qty=842,
        served_qty=817,
        surplus_qty=25,
        waste_qty=6,
        notes="Standard optimal batch"
    )
    db.add(prod_log)

    # 6. Waste Records for 7x3 Weekly Heatmap
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    waste_samples = [
        ("Breakfast", 4.2, 1.2, 2.0),
        ("Lunch", 8.5, 3.1, 4.2),
        ("Dinner", 12.4, 4.8, 6.2),
    ]
    for dow in days:
        for sess, p_w, u_s, pl_w in waste_samples:
            w_rec = WasteRecord(
                hostel_id=hostel_a.id,
                date=today,
                meal_session=sess,
                day_of_week=dow,
                prep_waste_kg=p_w,
                unserved_surplus_kg=u_s,
                plate_waste_kg=pl_w,
                total_waste_kg=round(p_w + u_s + pl_w, 2),
                notes=f"Automated logging for {dow} {sess}"
            )
            db.add(w_rec)

    # 7. Surplus Listings
    surplus_1 = SurplusListing(
        id="surplus-1",
        hostel_id=hostel_a.id,
        title="Rajma Rice",
        meals=25,
        location_detail="Hostel A Dining Hall, Counter 2",
        distance_km=2.3,
        pickup_deadline="4:00 PM",
        time_remaining="1h 45m left",
        status="Published",
        temp_celsius=64,
        storage_condition="Insulated Stainless Steel Warmer",
        food_type="Cooked Main Course (Vegetarian)",
        fssai_safety_passed=True,
        dietary="Vegetarian",
        image_url="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
        pickup_otp="7412"
    )
    surplus_2 = SurplusListing(
        id="surplus-2",
        hostel_id=hostel_a.id,
        title="Roti + Dal Makhani",
        meals=40,
        location_detail="Hostel A Kitchen Bay, Gate 3",
        distance_km=3.1,
        pickup_deadline="5:00 PM",
        time_remaining="2h 45m left",
        status="Published",
        temp_celsius=68,
        storage_condition="Insulated Casseroles",
        food_type="Cooked Bread & Gravy (Vegetarian)",
        fssai_safety_passed=True,
        dietary="Vegetarian",
        image_url="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80",
        pickup_otp="3829"
    )
    db.add_all([surplus_1, surplus_2])

    # 8. NGO Shelter Demand Registrations
    dem_1 = NgoDemand(
        id="dem-01",
        ngo_id=ngo_profile.id,
        shelter_name="Asha Jyoti Children Home",
        people_count=45,
        food_preference="Vegetarian",
        required_before="5:30 PM",
        location="Sector 14 Community Hall",
        status="Active",
        notes="Dinner support needed for 45 children"
    )
    dem_2 = NgoDemand(
        id="dem-02",
        ngo_id=ngo_profile.id,
        shelter_name="Kalyanpuri Night Shelter",
        people_count=80,
        food_preference="Vegetarian",
        required_before="6:30 PM",
        location="Gate 4 Underpass Shelter",
        status="Active",
        notes="Main course rice & bread prefered"
    )
    db.add_all([dem_1, dem_2])

    # 9. Active Surplus Request
    s_req = SurplusRequest(
        id="req-101",
        surplus_id=surplus_1.id,
        ngo_id=ngo_profile.id,
        volunteer_name="Rakesh Verma",
        vehicle="Electric Van (DL-04-EV-8821)",
        eta="Within 25 mins",
        status="Approved",
        otp="7412"
    )
    db.add(s_req)

    # 10. Distribution Records
    dist_1 = DistributionRecord(
        id="dist-201",
        ngo_id=ngo_profile.id,
        food_title="Kadhi Pakoda + Rice",
        beneficiaries_served=35,
        location="Kalyanpuri Labor Shelter",
        co2_diverted_kg=15.75,
        proof_status="Verified"
    )
    db.add(dist_1)

    # 11. Impact Events Timeline
    events = [
        ImpactEvent(
            event_type="MEAL_PREPARED",
            title="842 meals prepared for Lunch service",
            description="Production completed at Hostel A Central Mess Kitchen.",
            quantity=842,
            actor_role="admin",
            actor_name="Rajesh Kumar",
            hostel_id=hostel_a.id
        ),
        ImpactEvent(
            event_type="MEAL_SERVED",
            title="817 meals served to students",
            description="Actual consumption recorded with 25 unserved surplus portions.",
            quantity=817,
            actor_role="admin",
            actor_name="Rajesh Kumar",
            hostel_id=hostel_a.id
        ),
        ImpactEvent(
            event_type="SURPLUS_DETECTED",
            title="25 surplus meals identified for rescue",
            description="Rajma Rice meets warm holding standards and certified safe for redistribution.",
            quantity=25,
            actor_role="system",
            actor_name="MessWise Sensor Hub",
            hostel_id=hostel_a.id
        ),
        ImpactEvent(
            event_type="SURPLUS_CLAIMED",
            title="25 meals claimed by Helping Hands NGO",
            description="Volunteer Rakesh Verma dispatched with Electric Van. Handover OTP: 7412.",
            quantity=25,
            actor_role="ngo",
            actor_name="Helping Hands NGO",
            ngo_id=ngo_profile.id
        ),
        ImpactEvent(
            event_type="HANDOVER_VERIFIED",
            title="25 meals handed over to NGO team",
            description="Secure 4-digit OTP verified at kitchen dispatch counter.",
            quantity=25,
            actor_role="admin",
            actor_name="Rajesh Kumar",
            ngo_id=ngo_profile.id
        ),
        ImpactEvent(
            event_type="FOOD_DISTRIBUTED",
            title="35 beneficiaries served at Kalyanpuri Shelter",
            description="Hunger relief distribution completed. 15.75 kg CO₂ diverted from landfills.",
            quantity=35,
            actor_role="ngo",
            actor_name="Helping Hands NGO",
            ngo_id=ngo_profile.id,
            co2_saved_kg=15.75
        )
    ]
    db.add_all(events)

    await db.commit()
