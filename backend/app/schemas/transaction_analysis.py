from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class TransactionAnalysisRequest(BaseModel):
    amount: float = Field(gt=0)

    hour: int = Field(
        default=12,
        ge=0,
        le=23,
    )

    day_of_week: int = Field(
        default=0,
        ge=0,
        le=6,
    )

    customer_prior_count: int = Field(
        default=0,
        ge=0,
    )

    customer_prior_mean: float = Field(
        default=0.0,
        ge=0,
    )

    customer_prior_std: float = Field(
        default=0.0,
        ge=0,
    )

    customer_time_since_previous_sec: float = Field(
        default=3600.0,
        ge=0,
    )

    terminal_prior_count: int = Field(
        default=0,
        ge=0,
    )

    customer_terminal_prior_count: int = Field(
        default=0,
        ge=0,
    )

    TX_TIME_SECONDS: float = Field(
        default=0.0,
        ge=0,
    )

    TX_TIME_DAYS: float = Field(
        default=0.0,
        ge=0,
    )

    is_new_recipient: bool = False