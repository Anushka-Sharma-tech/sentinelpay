from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import require_user
from app.schemas.transaction_analysis import (
    TransactionAnalysisRequest,
)
from app.services.risk_analyzer import risk_analyzer


router = APIRouter(
    prefix="/api/v1",
    tags=["risk"],
)


@router.post("/analyze")
async def analyze_transaction(
    request: TransactionAnalysisRequest,
    user=Depends(require_user),
):
    try:
        result = risk_analyzer.analyze(
            request.model_dump()
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Risk analysis failed.",
        ) from exc