def generate_explanations(
    triggers: list[str],
    transaction_risk: dict,
    acoustic: float,
    speaker: float,
) -> list[str]:

    explanations = []

    if "OTP_REQUEST" in triggers:
        explanations.append(
            "An OTP or verification-code request was detected."
        )

    if "URGENT_ACTION" in triggers:
        explanations.append(
            "Urgency language was detected."
        )

    if "BANK_IMPERSONATION" in triggers:
        explanations.append(
            "Possible bank impersonation language was detected."
        )

    if "PAYMENT_REQUEST" in triggers:
        explanations.append(
            "The conversation contains a payment request."
        )

    if transaction_risk["amount_risk"] > 0.5:
        explanations.append(
            "The transaction amount is substantially above the "
            "historical baseline."
        )

    if transaction_risk["recipient_risk"] > 0:
        explanations.append(
            "The payment targets a new recipient."
        )

    if acoustic > 0.7:
        explanations.append(
            "The acoustic detector reports elevated spoof evidence."
        )

    if speaker < 0.5:
        explanations.append(
            "The current voice differs substantially from the "
            "stored speaker baseline."
        )

    return explanations