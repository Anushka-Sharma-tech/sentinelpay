def calculate_behaviour_risk(
    failed_attempts: int,
    retry_count: int,
    minutes_since_previous_transaction: float,
) -> float:

    retry_risk = min(
        1.0,
        retry_count / 8.0,
    )

    failure_risk = min(
        1.0,
        failed_attempts / 5.0,
    )

    timing_risk = (
        0.0
        if minutes_since_previous_transaction > 30
        else 0.5
    )

    return min(
        1.0,
        retry_risk * 0.35
        + failure_risk * 0.35
        + timing_risk * 0.30,
    )