import pytest
from app.core.security import create_access_token
from datetime import timedelta


# =========================================================================
# 1. STUDENT AUTHENTICATION TESTS
# =========================================================================

@pytest.mark.asyncio
async def test_student_login_success(client):
    response = await client.post(
        "/api/v1/auth/student/login",
        json={
            "enrollment_no": "2022CSB042",
            "father_name": "Ramesh Sharma"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "student"
    assert data["user"]["enrollment_no"] == "2022CSB042"
    assert data["user"]["name"] == "Nitin Sharma"


@pytest.mark.asyncio
async def test_student_login_invalid_enrollment(client):
    response = await client.post(
        "/api/v1/auth/student/login",
        json={
            "enrollment_no": "NON_EXISTENT_ROLL",
            "father_name": "Ramesh Sharma"
        }
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_student_login_invalid_father_name(client):
    response = await client.post(
        "/api/v1/auth/student/login",
        json={
            "enrollment_no": "2022CSB042",
            "father_name": "Wrong Father Name"
        }
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_student_login_missing_fields(client):
    response = await client.post(
        "/api/v1/auth/student/login",
        json={"enrollment_no": "2022CSB042"}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_student_access_student_api(client):
    login_res = await client.post(
        "/api/v1/auth/student/login",
        json={
            "enrollment_no": "2022CSB042",
            "father_name": "Ramesh Sharma"
        }
    )
    token = login_res.json()["access_token"]

    res = await client.get(
        "/api/v1/student/meals/today",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert "meals" in res.json()


@pytest.mark.asyncio
async def test_student_access_admin_api_forbidden(client):
    login_res = await client.post(
        "/api/v1/auth/student/login",
        json={
            "enrollment_no": "2022CSB042",
            "father_name": "Ramesh Sharma"
        }
    )
    token = login_res.json()["access_token"]

    res = await client.get(
        "/api/v1/admin/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 403


# =========================================================================
# 2. ADMIN AUTHENTICATION TESTS
# =========================================================================

@pytest.mark.asyncio
async def test_admin_login_success(client):
    response = await client.post(
        "/api/v1/auth/admin/login",
        json={
            "username": "admin",
            "password": "Admin@123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["username"] == "admin"


@pytest.mark.asyncio
async def test_admin_login_invalid_password(client):
    response = await client.post(
        "/api/v1/auth/admin/login",
        json={
            "username": "admin",
            "password": "WrongPassword@123"
        }
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_access_admin_api(client):
    login_res = await client.post(
        "/api/v1/auth/admin/login",
        json={
            "username": "admin",
            "password": "Admin@123"
        }
    )
    token = login_res.json()["access_token"]

    res = await client.get(
        "/api/v1/admin/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert "today_stats" in res.json()


@pytest.mark.asyncio
async def test_admin_access_student_api_forbidden(client):
    login_res = await client.post(
        "/api/v1/auth/admin/login",
        json={
            "username": "admin",
            "password": "Admin@123"
        }
    )
    token = login_res.json()["access_token"]

    res = await client.get(
        "/api/v1/student/meals/today",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 403


# =========================================================================
# 3. NGO AUTHENTICATION TESTS
# =========================================================================

@pytest.mark.asyncio
async def test_ngo_login_success(client):
    response = await client.post(
        "/api/v1/auth/ngo/login",
        json={
            "email": "ngo@helpinghands.org",
            "password": "Ngo@123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ngo"
    assert "Helping Hands" in data["user"]["organization_name"]


@pytest.mark.asyncio
async def test_ngo_login_invalid_password(client):
    response = await client.post(
        "/api/v1/auth/ngo/login",
        json={
            "email": "ngo@helpinghands.org",
            "password": "WrongPassword"
        }
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_ngo_access_ngo_api(client):
    login_res = await client.post(
        "/api/v1/auth/ngo/login",
        json={
            "email": "ngo@helpinghands.org",
            "password": "Ngo@123"
        }
    )
    token = login_res.json()["access_token"]

    res = await client.get(
        "/api/v1/ngo/surplus/available",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert "items" in res.json()


@pytest.mark.asyncio
async def test_ngo_access_admin_api_forbidden(client):
    login_res = await client.post(
        "/api/v1/auth/ngo/login",
        json={
            "email": "ngo@helpinghands.org",
            "password": "Ngo@123"
        }
    )
    token = login_res.json()["access_token"]

    res = await client.get(
        "/api/v1/admin/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 403


# =========================================================================
# 4. JWT VALIDATION & /auth/me TESTS
# =========================================================================

@pytest.mark.asyncio
async def test_auth_me_endpoint(client):
    login_res = await client.post(
        "/api/v1/auth/student/login",
        json={
            "enrollment_no": "2022CSB042",
            "father_name": "Ramesh Sharma"
        }
    )
    token = login_res.json()["access_token"]

    res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "student"
    assert data["name"] == "Nitin Sharma"


@pytest.mark.asyncio
async def test_auth_me_missing_token(client):
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_invalid_token(client):
    res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.garbage"}
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_expired_token(client):
    expired_token = create_access_token(
        subject="usr-student-01",
        role="student",
        expires_delta=timedelta(seconds=-10)
    )
    res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_logout_endpoint(client):
    res = await client.post("/api/v1/auth/logout")
    assert res.status_code == 200
    assert res.json()["message"] == "Logged out successfully"
