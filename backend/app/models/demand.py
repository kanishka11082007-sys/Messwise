import uuid
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class NgoDemand(Base):
    __tablename__ = "ngo_demands"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ngo_id = Column(String(36), ForeignKey("ngo_profiles.id"), nullable=False)
    shelter_name = Column(String(255), nullable=False)
    people_count = Column(Integer, nullable=False)
    food_preference = Column(String(50), default="Vegetarian")  # Vegetarian, Non-Vegetarian, Any
    required_before = Column(String(100), nullable=False)  # e.g., "6:00 PM"
    location = Column(String(255), nullable=True)
    status = Column(String(50), default="Active")  # Active, Fulfilled, Expired
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    ngo = relationship("NgoProfile", foreign_keys=[ngo_id])


class ForecastRecord(Base):
    __tablename__ = "forecast_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=False)
    target_date = Column(Date, default=date.today, index=True, nullable=False)
    meal_session = Column(String(50), nullable=False)
    expected_attendance = Column(Integer, nullable=False)
    recommended_prep = Column(Integer, nullable=False)
    safety_buffer = Column(Integer, default=15)
    confidence_score = Column(Float, default=0.94)
    model_name = Column(String(100), default="MessWise XGBoost v2.1")
    signals_json = Column(Text, nullable=True)  # JSON breakdown of contributing factors
    actual_attendance = Column(Integer, nullable=True)  # Populated after meal completion
    error_abs = Column(Integer, nullable=True)          # abs(expected - actual)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    hostel = relationship("Hostel", foreign_keys=[hostel_id])
