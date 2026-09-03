def decide(score: float) -> tuple[str, str]:

    if score < 0.40:
        return "ALLOW", "LOW"

    if score < 0.70:
        return "STEP_UP_VERIFICATION", "MEDIUM"

    if score < 0.85:
        return "MANUAL_REVIEW", "HIGH"

    return "ESCALATE", "CRITICAL"