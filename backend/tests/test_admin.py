import pytest


@pytest.mark.asyncio
async def test_admin_dashboard_stats(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    token = login_res.json()["access_token"]

    response = await client.get(
        "/api/v1/admin/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "today_stats" in data
    assert data["today_stats"]["prepared"] >= 0


@pytest.mark.asyncio
async def test_log_production(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    token = login_res.json()["access_token"]

    response = await client.post(
        "/api/v1/admin/production/log",
        json={
            "meal_session": "Dinner",
            "prepared_qty": 500,
            "served_qty": 480,
            "waste_qty": 5,
            "notes": "Optimal evening turnout"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["prepared"] == 500
    assert data["served"] == 480
    assert data["surplus"] == 20


@pytest.mark.asyncio
async def test_publish_surplus(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    token = login_res.json()["access_token"]

    response = await client.post(
        "/api/v1/admin/surplus/publish",
        json={
            "title": "Vegetable Pulao",
            "meals": 35,
            "temp_celsius": 68,
            "pickup_deadline": "6:00 PM"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Vegetable Pulao"
    assert data["meals"] == 35
    assert "pickup_otp" in data
