from pydantic import BaseModel, Field


class SignalScores(BaseModel):
    acoustic: float = Field(ge=0, le=1)
    prosody: float = Field(ge=0, le=1)
    speaker: float = Field(ge=0, le=1)
    context: float = Field(ge=0, le=1)
    behaviour: float = Field(ge=0, le=1)
    transaction: float = Field(ge=0, le=1)


class RiskFactor(BaseModel):
    factor_type: str
    factor_name: str
    contribution: float
    evidence: dict = Field(default_factory=dict)


class RiskResult(BaseModel):
    risk_score: float = Field(ge=0, le=100)
    risk_level: str
    decision: str

    signals: SignalScores
    factors: list[RiskFactor]
    explanations: list[str]

    model_version: str
    latency_ms: float