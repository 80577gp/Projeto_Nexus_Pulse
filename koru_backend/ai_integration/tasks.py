"""Celery tasks for KORU DeepScan AI workflows."""

from __future__ import annotations

from koru_backend.celery_compat import shared_task

from .services import build_gap_analysis_prompt, request_gap_analysis


@shared_task
def analyze_student_gap(
    *,
    gap_id: str,
    student_failure_summary: str,
    target_skill: str,
    expected_answer: str | None = None,
    prerequisite_skills: list[str] | None = None,
    additional_context: str | None = None,
):
    """
    Analyze a failed student attempt and return a structured gap diagnosis.

    Returns a JSON-serializable dict with:
    - gap_id
    - explanation
    - recovery_steps
    """

    prompt = build_gap_analysis_prompt(
        gap_id=gap_id,
        student_failure_summary=student_failure_summary,
        target_skill=target_skill,
        expected_answer=expected_answer,
        prerequisite_skills=prerequisite_skills,
        additional_context=additional_context,
    )
    result = request_gap_analysis(prompt=prompt)
    return result.model_dump()
