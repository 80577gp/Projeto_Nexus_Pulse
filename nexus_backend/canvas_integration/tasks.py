"""
Celery tasks for the canvas_integration app.

This module contains background jobs responsible for synchronizing Canvas LMS
data into the local database.
"""

import logging
import os
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from nexus_backend.celery_compat import shared_task
from nexus_backend.http import requests

from .models import CanvasAssignment, CanvasCourse, CanvasGrade, CanvasIntegration
from .services import CanvasService


logger = logging.getLogger(__name__)


def _get_canvas_base_url(integration):
    """
    Resolve the Canvas base URL for a user integration.

    The current model does not yet store a per-user base URL, so the task falls
    back to the global environment variable.
    """

    return getattr(integration, "canvas_base_url", None) or os.environ.get("CANVAS_BASE_URL")


def _refresh_access_token_if_needed(integration, service):
    """
    Refresh the Canvas access token when the stored token is expired.

    Returns the valid access token that should be used for subsequent API calls.
    """

    if not integration.token_expires_at or integration.token_expires_at > timezone.now():
        return integration.access_token

    client_id = os.environ.get("CANVAS_CLIENT_ID")
    client_secret = os.environ.get("CANVAS_CLIENT_SECRET")

    if not client_id or not client_secret or not integration.refresh_token:
        raise ValueError("Canvas token refresh configuration is incomplete.")

    token_data = service.refresh_access_token(
        refresh_token=integration.refresh_token,
        client_id=client_id,
        client_secret=client_secret,
    )

    integration.access_token = token_data["access_token"]
    integration.refresh_token = token_data.get("refresh_token", integration.refresh_token)

    expires_at = token_data.get("expires_at")
    expires_in = token_data.get("expires_in")
    if isinstance(expires_at, str):
        integration.token_expires_at = parse_datetime(expires_at)
    elif expires_in:
        integration.token_expires_at = timezone.now() + timedelta(seconds=int(expires_in))

    integration.save(update_fields=["access_token", "refresh_token", "token_expires_at", "updated_at"])
    logger.info("Canvas token refreshed for user_id=%s", integration.user_id)
    return integration.access_token


def _parse_canvas_datetime(value):
    """Parse Canvas datetime strings into aware datetimes when possible."""
    if not value:
        return None
    return parse_datetime(value)


@shared_task
def sync_canvas_data_for_user(user_id):
    """
    Synchronize Canvas courses, assignments, and grades for a given user.

    Steps:
    1. Load the user's Canvas integration.
    2. Initialize CanvasService with the user's base URL and token.
    3. Refresh the token if it is expired.
    4. Fetch courses, assignments, and grades from Canvas.
    5. Upsert local records with update_or_create.
    6. Log successes and failures clearly.
    """

    User = get_user_model()

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.error("Canvas sync failed: user_id=%s not found", user_id)
        return None

    try:
        integration = CanvasIntegration.objects.get(user=user)
    except CanvasIntegration.DoesNotExist:
        logger.error("Canvas sync failed: no CanvasIntegration found for user_id=%s", user_id)
        return None

    canvas_base_url = _get_canvas_base_url(integration)
    if not canvas_base_url:
        logger.error("Canvas sync failed for user_id=%s: missing Canvas base URL", user_id)
        return None

    service = CanvasService(
        canvas_base_url=canvas_base_url,
        access_token=integration.access_token,
    )

    try:
        service.access_token = _refresh_access_token_if_needed(integration, service)

        try:
            user_profile = service.get_user_profile()
            canvas_user_id = user_profile.get("id")
            if canvas_user_id:
                integration.canvas_user_id = str(canvas_user_id)
                integration.save(update_fields=["canvas_user_id", "updated_at"])
        except Exception as exc:
            logger.warning(
                "Canvas sync warning for user_id=%s: could not fetch profile (%s)",
                user_id,
                str(exc),
            )

        courses_data = service.get_courses()
        synced_courses = 0
        synced_assignments = 0
        synced_grades = 0

        for course_data in courses_data:
            course, _ = CanvasCourse.objects.update_or_create(
                canvas_course_id=str(course_data["id"]),
                defaults={
                    "user": user,
                    "name": course_data.get("name", "Unnamed Course"),
                    "course_code": course_data.get("course_code"),
                    "enrollment_state": course_data.get("workflow_state"),
                },
            )
            synced_courses += 1

            try:
                assignments_data = service.get_assignments(course.canvas_course_id)
            except requests.HTTPError as exc:
                logger.warning(
                    "Canvas sync warning for user_id=%s course_id=%s: could not fetch assignments (%s)",
                    user_id,
                    course.canvas_course_id,
                    str(exc),
                )
                continue

            for assignment_data in assignments_data:
                assignment, _ = CanvasAssignment.objects.update_or_create(
                    canvas_assignment_id=str(assignment_data["id"]),
                    defaults={
                        "course": course,
                        "name": assignment_data.get("name", "Unnamed Assignment"),
                        "description": assignment_data.get("description", "") or "",
                        "due_date": _parse_canvas_datetime(assignment_data.get("due_at")),
                        "points_possible": assignment_data.get("points_possible"),
                    },
                )
                synced_assignments += 1

                try:
                    grade_data = service.get_grades(
                        course_id=course.canvas_course_id,
                        assignment_id=assignment.canvas_assignment_id,
                    )
                except requests.HTTPError as exc:
                    logger.warning(
                        "Canvas sync warning for user_id=%s assignment_id=%s: could not fetch grade (%s)",
                        user_id,
                        assignment.canvas_assignment_id,
                        str(exc),
                    )
                    continue

                CanvasGrade.objects.update_or_create(
                    assignment=assignment,
                    user=user,
                    defaults={
                        "score": grade_data.get("score"),
                        "grade": grade_data.get("grade"),
                        "submitted_at": _parse_canvas_datetime(grade_data.get("submitted_at")),
                        "graded_at": _parse_canvas_datetime(grade_data.get("graded_at")),
                    },
                )
                synced_grades += 1

        logger.info(
            "Canvas sync succeeded for user_id=%s: %s courses, %s assignments, %s grades",
            user_id,
            synced_courses,
            synced_assignments,
            synced_grades,
        )
        return {
            "user_id": user_id,
            "courses": synced_courses,
            "assignments": synced_assignments,
            "grades": synced_grades,
        }
    except Exception as exc:
        logger.exception("Canvas sync failed for user_id=%s: %s", user_id, str(exc))
        return None
