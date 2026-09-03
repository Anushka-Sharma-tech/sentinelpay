from dataclasses import dataclass


@dataclass
class FusionInput:
    acoustic: float
    prosody: float
    speaker: float
    context: float
    behaviour: float
    transaction: float


WEIGHTS = {
    "acoustic": 0.20,
    "prosody": 0.10,
    "speaker": 0.15,
    "context": 0.20,
    "behaviour": 0.15,
    "transaction": 0.20,
}


def fuse(values: FusionInput) -> float:

    score = (
        values.acoustic * WEIGHTS["acoustic"]
        + values.prosody * WEIGHTS["prosody"]
        + values.speaker * WEIGHTS["speaker"]
        + values.context * WEIGHTS["context"]
        + values.behaviour * WEIGHTS["behaviour"]
        + values.transaction * WEIGHTS["transaction"]
    )

    return float(max(0.0, min(1.0, score)))