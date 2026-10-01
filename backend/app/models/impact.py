import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class ImpactEvent(Base):
    __tablename__ = "impact_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String(50), nullable=False, index=True)
    # Types: MEAL_PREPARED, MEAL_SERVED, SURPLUS_DETECTED, SURPLUS_PUBLISHED,
    #        SURPLUS_CLAIMED, PICKUP_ASSIGNED, HANDOVER_VERIFIED, FOOD_DISTRIBUTED,
    #        RSVP_CREATED, RSVP_CANCELLED
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Integer, default=0)
    unit = Column(String(50), default="portions")
    actor_role = Column(String(50), nullable=True)  # student, admin, ngo, system
    actor_name = Column(String(255), nullable=True)
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=True)
    ngo_id = Column(String(36), ForeignKey("ngo_profiles.id"), nullable=True)
    co2_saved_kg = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    hostel = relationship("Hostel", foreign_keys=[hostel_id])
    ngo = relationship("NgoProfile", foreign_keys=[ngo_id])
