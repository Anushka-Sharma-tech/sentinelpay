def calculate_transaction_risk(
    amount: float,
    historical_average: float,
    is_new_recipient: bool,
    recent_transaction_count: int,
) -> dict:

    if historical_average <= 0:
        amount_ratio = 0.0
    else:
        amount_ratio = amount / historical_average

    amount_risk = min(
        1.0,
        max(0.0, (amount_ratio - 1.0) / 10.0),
    )

    recipient_risk = 0.35 if is_new_recipient else 0.0

    velocity_risk = min(
        1.0,
        recent_transaction_count / 10.0,
    )

    score = min(
        1.0,
        amount_risk * 0.5
        + recipient_risk * 0.3
        + velocity_risk * 0.2,
    )

    return {
        "score": score,
        "amount_ratio": amount_ratio,
        "amount_risk": amount_risk,
        "recipient_risk": recipient_risk,
        "velocity_risk": velocity_risk,
    }