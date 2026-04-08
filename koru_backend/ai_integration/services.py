"""OpenAI service helpers for KORU DeepScan tasks."""

from __future__ import annotations

import os

from openai import APIConnectionError, APITimeoutError, InternalServerError, OpenAI, RateLimitError
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from .schemas import StudentGapAnalysis


TRANSIENT_OPENAI_ERRORS = (
    APIConnectionError,
    APITimeoutError,
    RateLimitError,
    InternalServerError,
)


def build_gap_analysis_prompt(
    *,
    gap_id: str,
    student_failure_summary: str,
    target_skill: str,
    expected_answer: str | None = None,
    prerequisite_skills: list[str] | None = None,
    additional_context: str | None = None,
) -> str:
    """Build the user prompt for the DeepScan structured analysis."""
    prerequisite_block = ", ".join(prerequisite_skills or []) or "None provided"
    expected_answer_block = expected_answer or "Not provided"
    additional_context_block = additional_context or "Not provided"

    return (
        "You are KORU DeepScan. The student failed. Analyze the error against the "
        "target skill and determine whether the root cause is in a prerequisite skill. "
        "Return JSON: { gap_id, explanation, recovery_steps }.\n\n"
        f"gap_id: {gap_id}\n"
        f"target_skill: {target_skill}\n"
        f"student_failure_summary: {student_failure_summary}\n"
        f"expected_answer: {expected_answer_block}\n"
        f"prerequisite_skills: {prerequisite_block}\n"
        f"additional_context: {additional_context_block}"
    )


@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type(TRANSIENT_OPENAI_ERRORS),
)
def request_gap_analysis(*, prompt: str) -> StudentGapAnalysis:
    """Request a structured gap analysis from OpenAI with retry protection."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured in the environment.")

    model = os.environ.get("OPENAI_DEEPSCAN_MODEL", "gpt-4o-2024-08-06")
    client = OpenAI(api_key=api_key)

    response = client.responses.parse(
        model=model,
        input=[
            {
                "role": "system",
                "content": (
                    "You are KORU DeepScan, an academic diagnostic specialist. "
                    "Be precise, concise, and explicit about prerequisite-skill gaps."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        text_format=StudentGapAnalysis,
    )
    return response.output_parsed
