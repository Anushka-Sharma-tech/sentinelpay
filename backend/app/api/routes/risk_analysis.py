from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import require_user
from app.schemas.transaction_analysis import TransactionAnalysisRequest
from app.services.database import create_session, save_risk_event
from app.services.risk_analyzer import risk_analyzer


router = APIRouter(prefix="/api/v1", tags=["risk"])

DEMO_MERCHANT_ID = "52a63704-a0e7-4d95-b957-e6f61fa1169c"


@router.post("/analyze")
async def analyze_transaction(
    request: TransactionAnalysisRequest,
    user=Depends(require_user),
):
    try:
        # Require an authenticated Supabase user.
        user_id = (
            user.get("id")
            if isinstance(user, dict)
            else getattr(user, "id", None)
        )

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user ID is unavailable.",
            )

        # Run the risk model.
        request_data = request.model_dump()
        result = risk_analyzer.analyze(request_data)

        # Create a real session linked to the existing demo merchant.
        session = create_session(DEMO_MERCHANT_ID)

        # Persist the prediction using the valid session ID.
        saved_event = save_risk_event(
            session_id=session["id"],
            result=result,
        )

        result["event_id"] = saved_event["id"]
        result["session_id"] = session["id"]

        return result

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(f"Risk analysis error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Risk analysis failed.",
        ) from exc