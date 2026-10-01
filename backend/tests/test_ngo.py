import pytest


@pytest.mark.asyncio
async def test_get_available_surplus(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "helpinghands@ngo.org", "password": "ngo123", "role": "ngo"}
    )
    token = login_res.json()["access_token"]

    response = await client.get(
        "/api/v1/ngo/surplus/available",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["count"] >= 1


@pytest.mark.asyncio
async def test_request_surplus_and_handover_flow(client):
    # 1. NGO Login
    ngo_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "helpinghands@ngo.org", "password": "ngo123", "role": "ngo"}
    )
    ngo_token = ngo_login.json()["access_token"]

    # 2. Get available surplus
    feed = await client.get("/api/v1/ngo/surplus/available", headers={"Authorization": f"Bearer {ngo_token}"})
    items = feed.json()["items"]
    assert len(items) > 0
    surplus_id = items[0]["id"]

    # 3. NGO submits request
    req_res = await client.post(
        f"/api/v1/ngo/surplus/{surplus_id}/request",
        json={
            "volunteer_name": "Rakesh Verma",
            "vehicle": "Electric Van (DL-04-EV-8821)",
            "eta": "Within 20 mins"
        },
        headers={"Authorization": f"Bearer {ngo_token}"}
    )
    assert req_res.status_code == 201
    req_data = req_res.json()
    request_id = req_data["id"]
    otp = req_data["otp"]

    # 4. Admin Login
    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    admin_token = admin_login.json()["access_token"]

    # 5. Admin Approves
    app_res = await client.post(
        f"/api/v1/admin/requests/{request_id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert app_res.status_code == 200

    # 6. Admin Verifies Handover OTP
    verify_res = await client.post(
        "/api/v1/admin/handover/verify",
        json={"request_id": request_id, "otp": otp},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["success"] is True


@pytest.mark.asyncio
async def test_log_distribution(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "helpinghands@ngo.org", "password": "ngo123", "role": "ngo"}
    )
    token = login_res.json()["access_token"]

    response = await client.post(
        "/api/v1/ngo/distribution/log",
        json={
            "food_title": "Rajma Rice",
            "beneficiaries_served": 30,
            "location": "Kalyanpuri Labor Shelter",
            "notes": "Safe hot distribution"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["beneficiaries_served"] == 30
    assert data["co2_diverted_kg"] > 0
