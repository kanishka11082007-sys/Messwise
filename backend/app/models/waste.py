import uuid
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=False)
    date = Column(Date, default=date.today, index=True, nullable=False)
    meal_session = Column(String(50), nullable=False)  # Breakfast, Lunch, Dinner
    day_of_week = Column(String(20), nullable=False)   # Monday - Sunday
    prep_waste_kg = Column(Float, default=0.0)
    unserved_surplus_kg = Column(Float, default=0.0)
    plate_waste_kg = Column(Float, default=0.0)
    total_waste_kg = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    hostel = relationship("Hostel", foreign_keys=[hostel_id])
