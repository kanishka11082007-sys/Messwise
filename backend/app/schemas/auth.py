from typing import Optional, Any
from pydantic import BaseModel, EmailStr


class StudentLoginRequest(BaseModel):
    enrollment_no: str
    father_name: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class NgoLoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    enrollment_no: Optional[str] = None
    password: Optional[str] = None
    father_name: Optional[str] = None
    role: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserMeResponse(BaseModel):
    id: str
    role: str
    email: Optional[str] = None
    username: Optional[str] = None
    name: Optional[str] = None
    enrollment_no: Optional[str] = None
    organization_name: Optional[str] = None
    hostel_id: Optional[str] = None
    is_active: bool = True


class UserPreferencesUpdate(BaseModel):
    diet: Optional[str] = None
    notifications_enabled: Optional[bool] = None
