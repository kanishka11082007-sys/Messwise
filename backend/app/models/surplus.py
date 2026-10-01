import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class SurplusListing(Base):
    __tablename__ = "surplus_listings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=False)
    title = Column(String(255), nullable=False)
    meals = Column(Integer, nullable=False)
    location_detail = Column(String(255), nullable=True)
    distance_km = Column(Float, default=2.0)
    pickup_deadline = Column(String(100), nullable=True)
    time_remaining = Column(String(100), default="2h left")
    status = Column(String(50), default="Published")  # Published, Requested, Ready For Pickup, PickedUp, Distributed
    prep_time = Column(String(100), default="Just now")
    temp_celsius = Column(Integer, default=65)
    storage_condition = Column(String(255), default="Insulated Stainless Steel Warmer")
    food_type = Column(String(255), default="Cooked Main Course")
    fssai_safety_passed = Column(Boolean, default=True)
    dietary = Column(String(50), default="Vegetarian")
    image_url = Column(String(500), nullable=True)
    requested_by_ngo = Column(String(255), nullable=True)
    pickup_otp = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    hostel = relationship("Hostel", back_populates="surplus_listings")
    requests = relationship("SurplusRequest", back_populates="surplus", cascade="all, delete-orphan")


class SurplusRequest(Base):
    __tablename__ = "surplus_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    surplus_id = Column(String(36), ForeignKey("surplus_listings.id"), nullable=False)
    ngo_id = Column(String(36), ForeignKey("ngo_profiles.id"), nullable=False)
    volunteer_name = Column(String(255), nullable=False)
    vehicle = Column(String(255), nullable=True)
    eta = Column(String(100), nullable=True)
    status = Column(String(50), default="Pending Approval")  # Pending Approval, Approved, In-Transit, Collected, Cancelled
    otp = Column(String(10), nullable=False)
    requested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    collected_at = Column(DateTime, nullable=True)

    # Relationships
    surplus = relationship("SurplusListing", back_populates="requests")
    ngo = relationship("NgoProfile", back_populates="requests")


class DistributionRecord(Base):
    __tablename__ = "distribution_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ngo_id = Column(String(36), ForeignKey("ngo_profiles.id"), nullable=False)
    food_title = Column(String(255), nullable=False)
    beneficiaries_served = Column(Integer, nullable=False)
    location = Column(String(255), nullable=False)
    proof_status = Column(String(50), default="Verified")
    co2_diverted_kg = Column(Float, default=0.0)
    delivered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)

    # Relationships
    ngo = relationship("NgoProfile", back_populates="distributions")
