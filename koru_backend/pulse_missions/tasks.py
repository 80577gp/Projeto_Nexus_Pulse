"""
Celery tasks for the pulse_missions app.

This module contains background jobs to generate weekly missions, calculate
effort rankings, and update grade correlation records.
"""

import logging
from decimal import Decimal

from django.db.models import Count
from django.utils import timezone

from core_users.models import User
from koru_backend.celery_compat import shared_task

from .models import EffortRanking, GradeCorrelation, Mission, MissionCompletion


logger = logging.getLogger(__name__)


@shared_task
def generate_weekly_missions_for_all_users():
    """
    Generate weekly missions for all student users.
    """

    now = timezone.now()
    created_count = 0

    students = User.objects.filter(role=User.ROLE_STUDENT, is_active=True)

    for student in students:
        title = "Complete your weekly study mission"
        description = (
            "Reserve focused study time this week and complete at least one "
            "important academic task."
        )
        due_date = now + timezone.timedelta(days=7)

        existing_mission = Mission.objects.filter(
            student=student,
            title=title,
            status="pending",
            created_at__date=now.date(),
        ).first()

        if existing_mission:
            continue

        mission = Mission.objects.create(
            student=student,
            title=title,
            description=description,
            due_date=due_date,
        )
        if mission:
            created_count += 1
            logger.info("Created weekly mission for user_id=%s mission_id=%s", student.id, mission.id)

    logger.info("Weekly mission generation finished. Created %s missions.", created_count)
    return created_count


@shared_task
def calculate_weekly_effort_ranking():
    """
    Calculate the weekly effort ranking for students.

    The ranking is based on the number of mission completions recorded in the
    last 7 days.
    """

    week_start = timezone.now() - timezone.timedelta(days=7)
    ranking_data = (
        MissionCompletion.objects.filter(completed_at__gte=week_start)
        .values("mission__student")
        .annotate(total_completed=Count("id"))
        .order_by("-total_completed", "mission__student")
    )

    processed_users = set()

    for position, row in enumerate(ranking_data, start=1):
        student_id = row["mission__student"]
        total_completed = Decimal(row["total_completed"])
        processed_users.add(student_id)

        EffortRanking.objects.update_or_create(
            student_id=student_id,
            defaults={
                "weekly_score": total_completed,
                "ranking_position": position,
            },
        )

    # Ensure students without recent completions still have a ranking record.
    remaining_students = User.objects.filter(role=User.ROLE_STUDENT, is_active=True).exclude(
        id__in=processed_users
    )
    start_position = len(processed_users) + 1

    for offset, student in enumerate(remaining_students, start=0):
        EffortRanking.objects.update_or_create(
            student=student,
            defaults={
                "weekly_score": Decimal("0.00"),
                "ranking_position": start_position + offset,
            },
        )

    logger.info("Weekly effort ranking updated for %s students.", len(processed_users) + remaining_students.count())
    return len(processed_users)


@shared_task
def calculate_grade_correlation(grade_correlation_id):
    """
    Refresh a grade correlation record from the current mission completion count.
    """

    try:
        correlation = GradeCorrelation.objects.select_related("student").get(id=grade_correlation_id)
    except GradeCorrelation.DoesNotExist:
        logger.error(
            "Grade correlation skipped. GradeCorrelation id=%s was not found.",
            grade_correlation_id,
        )
        return None

    missions_completed = MissionCompletion.objects.filter(
        mission__student=correlation.student,
    ).count()

    grade_score = correlation.grade_score or Decimal("0.00")
    effort_score = Decimal(missions_completed)

    if missions_completed == 0:
        correlation_note = "No completed missions were linked to this assignment."
    elif grade_score >= Decimal("7.00"):
        correlation_note = "Higher mission completion appears to align with a positive grade outcome."
    else:
        correlation_note = "Mission effort was recorded, but the grade suggests more support may be needed."

    correlation.effort_score = effort_score
    correlation.grade_score = grade_score
    correlation.correlation_note = correlation_note
    correlation.save(update_fields=["effort_score", "grade_score", "correlation_note"])

    logger.info(
        "Grade correlation updated for user_id=%s correlation_id=%s",
        correlation.student_id,
        correlation.id,
    )
    return correlation.id
