from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


RiskLevel = Literal["low", "medium", "high", "critical"]

Decision = Literal[
    "ALLOW",
    "STEP_UP",
    "MANUAL_REVIEW",
    "BLOCK",
]


class SignalScores(BaseModel):
    acoustic: float = Field(ge=0.0, le=1.0)
    prosody: float = Field(ge=0.0, le=1.0)
    speaker: float = Field(ge=0.0, le=1.0)
    context: float = Field(ge=0.0, le=1.0)
    transaction: float = Field(ge=0.0, le=1.0)
    behaviour: float = Field(ge=0.0, le=1.0)


class RiskFactor(BaseModel):
    name: str
    category: str
    contribution: float
    evidence: str


class RiskResult(BaseModel):
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: RiskLevel
    decision: Decision

    signals: SignalScores

    factors: list[RiskFactor] = Field(default_factory=list)

    model_version: str
    calibrated: bool = False

    latency_ms: float | None = None