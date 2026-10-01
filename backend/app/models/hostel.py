import uuid
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship

from app.db.session import Base


class Hostel(Base):
    __tablename__ = "hostels"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    campus_block = Column(String(100), nullable=True)
    enrolled_boarders = Column(Integer, default=650)
    capacity = Column(Integer, default=800)

    # Relationships
    students = relationship("StudentProfile", back_populates="hostel")
    admins = relationship("AdminProfile", back_populates="hostel")
    schedules = relationship("MealSchedule", back_populates="hostel", cascade="all, delete-orphan")
    surplus_listings = relationship("SurplusListing", back_populates="hostel", cascade="all, delete-orphan")
    production_logs = relationship("DailyProductionLog", back_populates="hostel", cascade="all, delete-orphan")
