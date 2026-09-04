from functools import lru_cache

from supabase import create_client, Client

from app.config import get_settings


@lru_cache
def get_supabase_admin() -> Client:
    settings = get_settings()

    return create_client(
        settings.supabase_url,
        settings.supabase_secret_key,
    )


def create_session(merchant_id: str) -> dict:
    payload = {
        "merchant_id": merchant_id,
        "status": "active",
        "caller_reference": "api-risk-analysis",
    }

    response = (
        get_supabase_admin()
        .table("sessions")
        .insert(payload)
        .execute()
    )

    if not response.data:
        raise RuntimeError("Session was not created.")

    return response.data[0]


def save_risk_event(
    *,
    session_id: str,
    result: dict,
) -> dict:
    payload = {
        "session_id": session_id,
        "risk_score": result["risk_score"],
        "risk_level": result["risk_level"],
        "decision": result["decision"],
        "model_version": result["model_version"],
    }

    response = (
        get_supabase_admin()
        .table("risk_events")
        .insert(payload)
        .execute()
    )

    if not response.data:
        raise RuntimeError("Risk event was not persisted.")

    return response.data[0]


def get_latest_risk_event(session_id: str) -> dict | None:
    response = (
        get_supabase_admin()
        .table("risk_events")
        .select(
            "id, risk_score, risk_level, decision, model_version, created_at"
        )
        .eq("session_id", session_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]