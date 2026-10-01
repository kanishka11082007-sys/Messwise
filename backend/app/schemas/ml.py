from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ForecastPredictRequest(BaseModel):
    hostel_id: Optional[str] = None
    target_date: Optional[str] = None
    day_of_week: str = "wed"  # mon, tue, wed, thu, fri, sat, sun
    meal_session: str = "Lunch"  # Breakfast, Lunch, Dinner
    turnout_ratio: float = Field(default=0.92, ge=0.0, le=1.0)
    exam_season: bool = False
    holiday_factor: bool = False
    weather: str = "clear"
    menu_id: Optional[str] = "m-rajma"


class SignalBreakdown(BaseModel):
    current_rsvps: int
    historical_baseline: int
    day_factor: int
    campus_event: int
    recent_opt_outs: int


class ForecastPredictResponse(BaseModel):
    target_date: str
    meal_session: str
    expected_demand: int
    recommended_cook: int
    safety_buffer: int
    buffer_margin_percent: float
    waste_risk: str
    confidence_percent: float
    model_version: str
    signals: SignalBreakdown
    insights: List[str]


class WhatIfSimulateRequest(BaseModel):
    base_attendance: int = Field(default=560, ge=50, le=2000)
    turnout_delta_pct: float = Field(default=5.0, ge=-50.0, le=50.0)
    safety_buffer: int = Field(default=15, ge=0, le=100)
    event_type: str = "Normal"  # Normal, Exam Week, Festival, Rain Storm
    meal_session: str = "Lunch"


class WhatIfSimulateResponse(BaseModel):
    original_forecast: int
    simulated_demand: int
    simulated_prep: int
    buffer_used: int
    potential_surplus_risk_kg: float
    variance_percent: float
    recommendation: str


class AccuracyRecordOut(BaseModel):
    date: str
    meal_session: str
    forecast_demand: int
    actual_served: int
    abs_error: int
    accuracy_pct: float


class ForecastAccuracyResponse(BaseModel):
    mae: float
    rmse: float
    mean_accuracy_pct: float
    total_evaluations: int
    history: List[AccuracyRecordOut]
