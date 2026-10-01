from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.impact_service import impact_service
from app.schemas.impact import ImpactLedgerResponse

router = APIRouter(prefix="/impact", tags=["Impact Ledger & Audit"])


@router.get("/ledger", response_model=ImpactLedgerResponse)
async def get_impact_ledger(
    limit: int = Query(default=50, ge=5, le=100),
    db: AsyncSession = Depends(get_db)
):
    return await impact_service.get_ledger(db=db, limit=limit)
