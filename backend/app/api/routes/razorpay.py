from __future__ import annotations

import razorpay
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import get_settings
from app.services.database import get_latest_risk_event


router = APIRouter(
    prefix="/api/v1/razorpay",
    tags=["razorpay"],
)


class CreateOrderRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = "INR"
    receipt: str | None = None
    session_id: str


@router.post("/orders")
async def create_order(
    request: CreateOrderRequest,
):
    risk_event = get_latest_risk_event(request.session_id)

    if not risk_event:
        raise HTTPException(
            status_code=403,
            detail="Payment requires a current risk assessment for this session.",
        )

    if risk_event["decision"] != "ALLOW":
        raise HTTPException(
            status_code=403,
            detail=(
                f"Payment blocked by SentinelPay risk policy: "
                f"{risk_event['risk_level']} / {risk_event['decision']}."
            ),
        )

    settings = get_settings()

    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise HTTPException(
            status_code=500,
            detail="Razorpay test credentials are not configured.",
        )

    try:
        client = razorpay.Client(
            auth=(
                settings.razorpay_key_id,
                settings.razorpay_key_secret,
            )
        )

        amount_in_paise = int(round(request.amount * 100))

        order_data = {
            "amount": amount_in_paise,
            "currency": request.currency,
            "receipt": request.receipt or "sentinelpay-test",
            "notes": {
                "source": "sentinelpay",
                "environment": settings.app_env,
                "session_id": request.session_id,
                "risk_event_id": risk_event["id"],
            },
        }

        order = client.order.create(data=order_data)

        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "status": order["status"],
            "key_id": settings.razorpay_key_id,
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"Razorpay order creation error: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Razorpay order creation failed.",
        ) from exc