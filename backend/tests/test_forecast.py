import pytest
from app.ml.forecast_engine import forecast_engine


def test_forecast_engine_regular():
    result = forecast_engine.predict(
        base_capacity=650,
        day_of_week="wed",
        meal_session="Lunch",
        turnout_ratio=0.92,
        exam_season=False,
        holiday_factor=False,
        weather="clear"
    )
    assert "expected_demand" in result
    assert "recommended_cook" in result
    assert result["recommended_cook"] >= result["expected_demand"]
    assert result["buffer_margin_percent"] == 2.6
    assert len(result["insights"]) >= 3


def test_forecast_engine_rain_and_exams():
    result = forecast_engine.predict(
        base_capacity=650,
        day_of_week="wed",
        meal_session="Lunch",
        turnout_ratio=0.92,
        exam_season=True,
        holiday_factor=False,
        weather="heavy_rain"
    )
    assert result["expected_demand"] > 600


@pytest.mark.asyncio
async def test_forecast_api_endpoint(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    token = login_res.json()["access_token"]

    response = await client.post(
        "/api/v1/admin/forecast/predict",
        json={
            "day_of_week": "wed",
            "meal_session": "Lunch",
            "turnout_ratio": 0.92,
            "exam_season": False,
            "holiday_factor": False,
            "weather": "clear"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["expected_demand"] > 0
    assert data["recommended_cook"] >= data["expected_demand"]
    assert len(data["insights"]) > 0
