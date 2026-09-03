import re


RULES = {
    "OTP_REQUEST": [
        r"\botp\b",
        r"one[- ]time password",
        r"verification code",
    ],
    "URGENT_ACTION": [
        r"\burgent\b",
        r"\bimmediately\b",
        r"\bright now\b",
        r"\bwithin \d+ minutes?\b",
    ],
    "BANK_IMPERSONATION": [
        r"\bfrom your bank\b",
        r"\bbank officer\b",
        r"\bsecurity department\b",
    ],
    "KYC_THREAT": [
        r"\bkyc\b",
        r"\baccount.*blocked\b",
        r"\baccount.*suspend",
    ],
    "PAYMENT_REQUEST": [
        r"\btransfer\b",
        r"\bsend\b.*\bmoney\b",
        r"\bupi\b",
        r"\bpayment\b",
    ],
    "REMOTE_ACCESS": [
        r"\banydesk\b",
        r"\bteamviewer\b",
        r"\bremote access\b",
    ],
}


WEIGHTS = {
    "OTP_REQUEST": 0.24,
    "URGENT_ACTION": 0.15,
    "BANK_IMPERSONATION": 0.18,
    "KYC_THREAT": 0.16,
    "PAYMENT_REQUEST": 0.17,
    "REMOTE_ACCESS": 0.20,
}


def analyze_text(text: str) -> dict:
    normalized = text.lower()

    hits = []

    for name, patterns in RULES.items():
        if any(
            re.search(pattern, normalized)
            for pattern in patterns
        ):
            hits.append(name)

    score = min(
        1.0,
        sum(WEIGHTS[name] for name in hits),
    )

    return {
        "score": score,
        "triggers": hits,
    }