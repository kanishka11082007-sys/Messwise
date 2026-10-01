from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SurplusListingOut(BaseModel):
    id: str
    title: str
    meals: int
    hostel: str
    location_detail: Optional[str] = None
    distance_km: float
    pickup_deadline: str
    time_remaining: str
    status: str
    temp_celsius: int
    storage_condition: str
    food_type: str
    dietary: str
    image_url: Optional[str] = None
    fssai_safety_passed: bool = True
    requested_by_ngo: Optional[str] = None
    pickup_otp: Optional[str] = None


class SurplusFeedResponse(BaseModel):
    count: int
    items: List[SurplusListingOut]


class NgoDemandCreate(BaseModel):
    shelter_name: str
    people_count: int = Field(gt=0)
    food_preference: str = "Vegetarian"  # Vegetarian, Non-Vegetarian, Any
    required_before: str = "6:00 PM"
    location: Optional[str] = None
    notes: Optional[str] = None


class NgoDemandOut(BaseModel):
    id: str
    shelter_name: str
    people_count: int
    food_preference: str
    required_before: str
    location: Optional[str] = None
    status: str
    created_at: str


class SmartMatchOut(BaseModel):
    surplus_id: str
    food_title: str
    meals: int
    hostel: str
    distance_km: float
    pickup_deadline: str
    match_score: float  # e.g., 0.92
    match_reasons: List[str]


class SmartMatchResponse(BaseModel):
    count: int
    matches: List[SmartMatchOut]


class SurplusRequestCreate(BaseModel):
    volunteer_name: str
    vehicle: Optional[str] = "Insulated Van"
    eta: Optional[str] = "Within 30 mins"


class SurplusRequestOut(BaseModel):
    id: str
    surplus_id: str
    food_title: str
    meals: int
    hostel: str
    volunteer_name: str
    vehicle: Optional[str] = None
    requested_at: str
    status: str
    pickup_time_estimated: Optional[str] = None
    otp: str


class DistributionLogRequest(BaseModel):
    food_title: str
    beneficiaries_served: int = Field(gt=0)
    location: str
    notes: Optional[str] = None


class DistributionRecordOut(BaseModel):
    id: str
    food_title: str
    beneficiaries_served: int
    location: str
    delivered_at: str
    co2_diverted_kg: float
    proof_status: str
