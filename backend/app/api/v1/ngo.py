from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ngo_service import ngo_service
from app.schemas.ngo import (
    SurplusFeedResponse,
    SurplusRequestCreate,
    SurplusRequestOut,
    DistributionLogRequest,
    DistributionRecordOut,
    NgoDemandCreate,
    NgoDemandOut,
    SmartMatchResponse
)

router = APIRouter(prefix="/ngo", tags=["NGO Food Rescue Logistics"])


@router.get("/surplus-feed", response_model=SurplusFeedResponse)
@router.get("/surplus/available", response_model=SurplusFeedResponse)
async def get_surplus_feed(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else None
    return await ngo_service.get_surplus_feed(db=db, ngo_id=ngo_id)


@router.post("/demands", response_model=NgoDemandOut)
async def register_demand(
    req: NgoDemandCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else "usr-ngo-01"
    return await ngo_service.register_demand(db=db, ngo_id=ngo_id, req=req)


@router.get("/smart-matches", response_model=SmartMatchResponse)
async def get_smart_matches(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else "usr-ngo-01"
    return await ngo_service.get_smart_matches(db=db, ngo_id=ngo_id)


@router.post("/claim-surplus/{surplus_id}", response_model=SurplusRequestOut, status_code=status.HTTP_201_CREATED)
@router.post("/surplus/{surplus_id}/request", response_model=SurplusRequestOut, status_code=status.HTTP_201_CREATED)
async def claim_surplus(
    surplus_id: str,
    req: SurplusRequestCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else "usr-ngo-01"
    ngo_org = current_user.ngo_profile.organization_name if (current_user and current_user.ngo_profile) else "Helping Hands NGO"
    return await ngo_service.create_surplus_request(
        db=db,
        surplus_id=surplus_id,
        ngo_id=ngo_id,
        req=req,
        ngo_org_name=ngo_org
    )


@router.post("/log-distribution", response_model=DistributionRecordOut, status_code=status.HTTP_201_CREATED)
@router.post("/distribution/log", response_model=DistributionRecordOut, status_code=status.HTTP_201_CREATED)
async def log_distribution(
    req: DistributionLogRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else "usr-ngo-01"
    ngo_org = current_user.ngo_profile.organization_name if (current_user and current_user.ngo_profile) else "Helping Hands NGO"
    return await ngo_service.log_distribution(
        db=db,
        ngo_id=ngo_id,
        req=req,
        ngo_org_name=ngo_org
    )
