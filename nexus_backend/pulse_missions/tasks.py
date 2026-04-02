"""
Celery tasks for the pulse_missions app.

This module contains background jobs to generate weekly missions, calculate
effort rankings, and update grade correlation records from Canvas data.
"""

import logging
from decimal import Decimal

from django.db.models import Count
from django.utils import timezone

from canvas_integration.models import CanvasAssignment, CanvasGrade
from core_users.models import User
from nexus_backend.celery_compat import shared_task

from .models import EffortRanking, GradeCorrelation, Mission, MissionCompletion


logger = logging.getLogger(__name__)


@shared_task
def generate_weekly_missions_for_all_users():
    """
    Generate weekly missions for all student users.

    The task tries to reuse upcoming Canvas assignments first. If a student does
    not have a suitable assignment, a generic weekly mission is created instead.
    """

    now = timezone.now()
    created_count = 0

    students = User.objects.filter(role=User.ROLE_STUDENT, is_active=True)

    for student in students:
        assignment = (
            CanvasAssignment.objects.filter(course__user=student)
            .order_by("due_date", "id")
            .first()
        )

        if assignment:
            title = f"Complete assignment: {assignment.name}"
            description = assignment.description or (
                "Review the linked Canvas assignment and complete it this week."
            )
            due_date = assignment.due_date
        else:
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
            canvas_assignment=assignment,
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
def calculate_grade_correlation(canvas_grade_id):
    """
    Update a grade correlation record when a Canvas grade changes.

    This task is intended to be triggered after a CanvasGrade is created or
    updated.
    """

    try:
        canvas_grade = CanvasGrade.objects.select_related("user", "assignment").get(id=canvas_grade_id)
    except CanvasGrade.DoesNotExist:
        logger.error("Grade correlation skipped. CanvasGrade id=%s was not found.", canvas_grade_id)
        return None

    missions_completed = MissionCompletion.objects.filter(
        mission__student=canvas_grade.user,
        mission__canvas_assignment=canvas_grade.assignment,
    ).count()

    grade_score = canvas_grade.score or Decimal("0.00")
    effort_score = Decimal(missions_completed)

    if missions_completed == 0:
        correlation_note = "No completed missions were linked to this assignment."
    elif grade_score >= Decimal("7.00"):
        correlation_note = "Higher mission completion appears to align with a positive grade outcome."
    else:
        correlation_note = "Mission effort was recorded, but the grade suggests more support may be needed."

    correlation, _ = GradeCorrelation.objects.update_or_create(
        student=canvas_grade.user,
        canvas_assignment=canvas_grade.assignment,
        defaults={
            "effort_score": effort_score,
            "grade_score": grade_score,
            "correlation_note": correlation_note,
        },
    )

    logger.info(
        "Grade correlation updated for user_id=%s assignment_id=%s correlation_id=%s",
        canvas_grade.user_id,
        canvas_grade.assignment_id,
        correlation.id,
    )
    return correlation.id
