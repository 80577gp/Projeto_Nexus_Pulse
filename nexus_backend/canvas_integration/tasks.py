"""
Celery tasks for the canvas_integration app.

This module contains background jobs responsible for synchronizing Canvas LMS
data into the local database.
"""

import logging
import os
from datetime import timedelta

import requests
from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import CanvasAssignment, CanvasCourse, CanvasGrade, CanvasIntegration


logger = logging.getLogger(__name__)


def _parse_canvas_datetime(value):
    """Parse Canvas datetime strings into aware datetimes when possible."""
    if not value:
        return None

    parsed = timezone.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if timezone.is_naive(parsed):
        return timezone.make_aware(parsed, timezone.utc)
    return parsed


def _refresh_canvas_token(integration):
    """
    Refresh the Canvas access token when it has expired.

    Returns the valid access token to use for subsequent API calls.
    """

    if not integration.token_expires_at or integration.token_expires_at > timezone.now():
        return integration.access_token

    client_id = os.environ.get("CANVAS_CLIENT_ID")
    client_secret = os.environ.get("CANVAS_CLIENT_SECRET")
    redirect_uri = os.environ.get("CANVAS_REDIRECT_URI")
    base_url = os.environ.get("CANVAS_BASE_URL")

    if not all([client_id, client_secret, redirect_uri, base_url, integration.refresh_token]):
        raise ValueError("Canvas token refresh configuration is incomplete.")

    token_url = f"{base_url.rstrip('/')}/login/oauth2/token"
    payload = {
        "grant_type": "refresh_token",
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "refresh_token": integration.refresh_token,
    }

    response = requests.post(token_url, data=payload, timeout=20)
    response.raise_for_status()
    token_data = response.json()

    integration.access_token = token_data["access_token"]
    integration.refresh_token = token_data.get("refresh_token", integration.refresh_token)

    expires_in = token_data.get("expires_in")
    if expires_in:
        integration.token_expires_at = timezone.now() + timedelta(seconds=int(expires_in))

    integration.save(update_fields=["access_token", "refresh_token", "token_expires_at", "updated_at"])
    logger.info("Canvas token refreshed for user_id=%s", integration.user_id)
    return integration.access_token


def _canvas_get(base_url, endpoint, access_token, params=None):
    """Perform an authenticated GET request to the Canvas API."""
    response = requests.get(
        f"{base_url.rstrip('/')}/api/v1/{endpoint.lstrip('/')}",
        headers={"Authorization": f"Bearer {access_token}"},
        params=params or {},
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


@shared_task
def sync_canvas_data_for_user(user_id):
    """
    Synchronize Canvas courses, assignments, and grades for a given user.

    Steps:
    1. Load the user's Canvas integration.
    2. Refresh the access token if needed.
    3. Fetch courses, assignments, and grades from Canvas.
    4. Upsert local records with update_or_create.
    """

    try:
        user = get_user_model().objects.get(id=user_id)
    except get_user_model().DoesNotExist:
        logger.error("Canvas sync failed: user_id=%s not found", user_id)
        return

    try:
        integration = CanvasIntegration.objects.get(user=user)
    except CanvasIntegration.DoesNotExist:
        logger.error("Canvas sync failed: no CanvasIntegration for user_id=%s", user_id)
        return

    base_url = os.environ.get("CANVAS_BASE_URL")
    if not base_url:
        logger.error("Canvas sync failed: CANVAS_BASE_URL is not configured")
        return

    try:
        access_token = _refresh_canvas_token(integration)

        courses_data = _canvas_get(base_url, "courses", access_token)
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

            assignments_data = _canvas_get(
                base_url,
                f"courses/{course.canvas_course_id}/assignments",
                access_token,
            )

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

                submission_data = _canvas_get(
                    base_url,
                    f"courses/{course.canvas_course_id}/assignments/{assignment.canvas_assignment_id}/submissions/self",
                    access_token,
                )

                CanvasGrade.objects.update_or_create(
                    assignment=assignment,
                    user=user,
                    defaults={
                        "score": submission_data.get("score"),
                        "grade": submission_data.get("grade"),
                        "submitted_at": _parse_canvas_datetime(submission_data.get("submitted_at")),
                        "graded_at": _parse_canvas_datetime(submission_data.get("graded_at")),
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
    except Exception as exc:
        logger.exception("Canvas sync failed for user_id=%s: %s", user_id, str(exc))

