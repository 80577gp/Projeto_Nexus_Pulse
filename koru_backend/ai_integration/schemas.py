"""Pydantic schemas used by KORU DeepScan."""

from pydantic import BaseModel, Field


class StudentGapAnalysis(BaseModel):
    """Structured output returned by KORU DeepScan."""

    gap_id: str = Field(description="Stable identifier for the diagnosed learning gap.")
    explanation: str = Field(
        description="Clear explanation of the root cause, including whether it is linked to a prerequisite skill."
    )
    recovery_steps: list[str] = Field(
        description="Ordered recovery actions the student should take next."
    )
