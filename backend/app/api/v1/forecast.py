from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.forecast_service import forecast_service
from app.schemas.ml import (
    ForecastPredictRequest,
    ForecastPredictResponse,
    WhatIfSimulateRequest,
    WhatIfSimulateResponse,
    ForecastAccuracyResponse
)

router = APIRouter(prefix="/forecast", tags=["Demand Forecasting & Simulation"])


@router.post("/predict", response_model=ForecastPredictResponse)
async def predict_demand(
    req: ForecastPredictRequest,
    db: AsyncSession = Depends(get_db)
):
    return await forecast_service.predict_demand(db=db, req=req)


@router.post("/simulate", response_model=WhatIfSimulateResponse)
async def simulate_what_if(req: WhatIfSimulateRequest):
    return forecast_service.simulate_what_if(req=req)


@router.get("/accuracy", response_model=ForecastAccuracyResponse)
async def get_forecast_accuracy(db: AsyncSession = Depends(get_db)):
    return await forecast_service.get_accuracy_metrics(db=db)
