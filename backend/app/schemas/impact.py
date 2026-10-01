from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ImpactEventOut(BaseModel):
    id: str
    event_type: str
    title: str
    description: Optional[str] = None
    quantity: int
    unit: str
    actor_role: Optional[str] = None
    actor_name: Optional[str] = None
    timestamp: str


class AggregateImpact(BaseModel):
    meals_rescued: int
    meals_served: int
    food_weight_redistributed_kg: float
    meals_prevented_overproduction: int
    verified_distributions: int
    beneficiaries_served: int
    estimated_co2_avoided_kg: float


class ImpactLedgerResponse(BaseModel):
    total_events: int
    events: List[ImpactEventOut]
    summary: AggregateImpact
