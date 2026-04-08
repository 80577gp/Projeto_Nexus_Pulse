"""Pydantic schemas used by KORU DeepScan."""

from pydantic import BaseModel, Field


class StudentGapAnalysis(BaseModel):
    """Structured output returned by KORU DeepScan."""

    root_cause_id: int = Field(description="Identifier of the prerequisite or base skill causing the failure.")
    explanation: str = Field(description="Clear explanation of the root cause for the student's failure.")
    priority: int = Field(description="Urgency from 1 to 5.", ge=1, le=5)
    recovery_plan: list[str] = Field(description="Ordered recovery actions the student should take next.")
