import pytest


@pytest.mark.asyncio
async def test_get_today_meals(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nitin.sharma@campus.edu", "password": "student123"}
    )
    token = login_res.json()["access_token"]

    response = await client.get(
        "/api/v1/student/meals/today",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "meals" in data
    assert "breakfast" in data["meals"]
    assert "lunch" in data["meals"]
    assert "dinner" in data["meals"]


@pytest.mark.asyncio
async def test_toggle_meal_booking(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nitin.sharma@campus.edu", "password": "student123"}
    )
    token = login_res.json()["access_token"]

    response = await client.post(
        "/api/v1/student/meals/toggle",
        json={"meal_session": "dinner"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["meal_session"] == "dinner"
    assert data["booked"] is True
    assert "token" in data


@pytest.mark.asyncio
async def test_submit_meal_feedback(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nitin.sharma@campus.edu", "password": "student123"}
    )
    token = login_res.json()["access_token"]

    response = await client.post(
        "/api/v1/student/feedback",
        json={
            "meal_session": "lunch",
            "rating": 5,
            "comment": "Delicious food!"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "submitted_at" in data
