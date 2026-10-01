import pytest


@pytest.mark.asyncio
async def test_complete_ecosystem_loop(client):
    # Authenticate Student
    r_s_login = await client.post(
        "/api/v1/auth/student/login",
        json={"enrollment_no": "2022CSB042", "father_name": "Ramesh Sharma"}
    )
    assert r_s_login.status_code == 200
    student_token = r_s_login.json()["access_token"]
    headers_student = {"Authorization": f"Bearer {student_token}"}

    # Authenticate Admin
    r_a_login = await client.post(
        "/api/v1/auth/admin/login",
        json={"username": "admin", "password": "Admin@123"}
    )
    assert r_a_login.status_code == 200
    admin_token = r_a_login.json()["access_token"]
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # Authenticate NGO
    r_n_login = await client.post(
        "/api/v1/auth/ngo/login",
        json={"email": "helpinghands@ngo.org", "password": "Ngo@123"}
    )
    assert r_n_login.status_code == 200
    ngo_token = r_n_login.json()["access_token"]
    headers_ngo = {"Authorization": f"Bearer {ngo_token}"}

    # STEP 1: Student Views Today's Meals & Toggles Booking
    r_meals = await client.get("/api/v1/student/today-meals", headers=headers_student)
    assert r_meals.status_code == 200
    meals_data = r_meals.json()
    assert "meals" in meals_data

    r_toggle = await client.post(
        "/api/v1/student/toggle-booking",
        json={"meal_session": "dinner"},
        headers=headers_student
    )
    assert r_toggle.status_code == 200
    toggle_data = r_toggle.json()
    assert toggle_data["meal_session"] == "dinner"

    # STEP 2: Student Submits Food Feedback
    r_fb = await client.post(
        "/api/v1/student/feedback",
        json={
            "meal_session": "lunch",
            "taste_rating": 5,
            "quantity_satisfaction": 5,
            "menu_rating": 4,
            "finished_meal": True,
            "comment": "Rajma rice was well cooked today."
        },
        headers=headers_student
    )
    assert r_fb.status_code == 201

    # STEP 3: Student Checks Personal Eco Impact
    r_imp = await client.get("/api/v1/student/impact", headers=headers_student)
    assert r_imp.status_code == 200
    assert r_imp.json()["eco_rank"] >= 1

    # STEP 4: Admin Generates Explainable Demand Forecast & What-If Simulation
    r_pred = await client.post(
        "/api/v1/forecast/predict",
        json={
            "day_of_week": "wed",
            "meal_session": "Lunch",
            "turnout_ratio": 0.92,
            "exam_season": False
        },
        headers=headers_admin
    )
    assert r_pred.status_code == 200
    pred_data = r_pred.json()
    assert pred_data["expected_demand"] > 0
    assert "signals" in pred_data
    assert pred_data["signals"]["current_rsvps"] >= 0

    # What-If Simulator
    r_sim = await client.post(
        "/api/v1/forecast/simulate",
        json={
            "base_attendance": 560,
            "turnout_delta_pct": 5.0,
            "safety_buffer": 15,
            "event_type": "Normal"
        },
        headers=headers_admin
    )
    assert r_sim.status_code == 200
    assert r_sim.json()["simulated_demand"] > 560

    # Forecast Accuracy
    r_acc = await client.get("/api/v1/forecast/accuracy", headers=headers_admin)
    assert r_acc.status_code == 200
    assert r_acc.json()["mae"] >= 0.0

    # STEP 5: Admin Logs Batch Production & Actual Serving
    r_prod = await client.post(
        "/api/v1/admin/production/log",
        json={
            "meal_session": "Lunch",
            "prepared_qty": 600,
            "served_qty": 575,
            "waste_qty": 5,
            "notes": "Optimal production batch"
        },
        headers=headers_admin
    )
    assert r_prod.status_code == 201
    assert r_prod.json()["surplus"] == 25

    # STEP 6: Admin Logs Structured Waste & Views 7x3 Waste Heatmap
    r_waste = await client.post(
        "/api/v1/admin/waste/log",
        json={
            "meal_session": "Lunch",
            "day_of_week": "Wednesday",
            "prep_waste_kg": 2.2,
            "unserved_surplus_kg": 6.8,
            "plate_waste_kg": 4.5
        },
        headers=headers_admin
    )
    assert r_waste.status_code == 201
    assert r_waste.json()["total_waste_kg"] == 13.5

    r_heat = await client.get("/api/v1/admin/waste/heatmap", headers=headers_admin)
    assert r_heat.status_code == 200
    assert "grid" in r_heat.json()
    assert "Lunch" in r_heat.json()["grid"]

    # STEP 7: Admin Publishes Surplus Food
    r_pub = await client.post(
        "/api/v1/admin/publish-surplus",
        json={
            "title": "Rajma Rice Batch #4",
            "meals": 25,
            "temp_celsius": 66,
            "pickup_deadline": "5:30 PM",
            "dietary": "Vegetarian"
        },
        headers=headers_admin
    )
    assert r_pub.status_code == 201
    pub_data = r_pub.json()
    surplus_id = pub_data["id"]
    pickup_otp = pub_data["pickup_otp"]

    # STEP 8: NGO Registers Shelter Demand
    r_dem = await client.post(
        "/api/v1/ngo/demands",
        json={
            "shelter_name": "Asha Sadan Shelter",
            "people_count": 50,
            "food_preference": "Vegetarian",
            "required_before": "6:00 PM"
        },
        headers=headers_ngo
    )
    assert r_dem.status_code == 200
    assert r_dem.json()["people_count"] == 50

    # STEP 9: NGO Evaluates Smart Matches
    r_match = await client.get("/api/v1/ngo/smart-matches", headers=headers_ngo)
    assert r_match.status_code == 200
    assert r_match.json()["count"] >= 1

    # STEP 10: NGO Claims Surplus (Concurrency Safe)
    r_claim = await client.post(
        f"/api/v1/ngo/claim-surplus/{surplus_id}",
        json={
            "volunteer_name": "Aman Patel",
            "vehicle": "Electric Van DL-01",
            "eta": "Within 20 mins"
        },
        headers=headers_ngo
    )
    assert r_claim.status_code == 201
    claim_data = r_claim.json()
    req_id = claim_data["id"]

    # Second claim attempt on same surplus should fail (concurrency check)
    r_claim2 = await client.post(
        f"/api/v1/ngo/claim-surplus/{surplus_id}",
        json={"volunteer_name": "Second Volunteer"},
        headers=headers_ngo
    )
    assert r_claim2.status_code == 409

    # STEP 11: Admin Verifies Handover with OTP
    r_verify = await client.post(
        "/api/v1/admin/verify-handover",
        json={"request_id": req_id, "otp": pickup_otp},
        headers=headers_admin
    )
    assert r_verify.status_code == 200
    assert r_verify.json()["success"] is True

    # STEP 12: NGO Logs Distribution Proof
    r_dist = await client.post(
        "/api/v1/ngo/log-distribution",
        json={
            "food_title": "Rajma Rice Batch #4",
            "beneficiaries_served": 25,
            "location": "Asha Sadan Shelter",
            "notes": "All meals served fresh and warm."
        },
        headers=headers_ngo
    )
    assert r_dist.status_code == 201
    assert r_dist.json()["beneficiaries_served"] == 25

    # STEP 13: View Complete Chronological Impact Ledger
    r_ledger = await client.get("/api/v1/impact/ledger", headers=headers_admin)
    assert r_ledger.status_code == 200
    ledger_data = r_ledger.json()
    assert ledger_data["total_events"] >= 6
    assert ledger_data["summary"]["meals_rescued"] >= 25
