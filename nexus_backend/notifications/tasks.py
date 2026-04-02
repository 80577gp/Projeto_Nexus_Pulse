"""
Celery tasks for the notifications app.

This module contains background jobs for mission reminder notifications and
daily BeReal-style prompts.
"""

import logging

from django.utils import timezone

from core_users.models import User
from nexus_backend.celery_compat import shared_task
from pulse_missions.models import Mission

from .models import Notification


logger = logging.getLogger(__name__)


@shared_task
def send_mission_reminders():
    """
    Send reminder notifications for upcoming missions.

    The task looks for pending missions due within the next 24 hours and creates
    a reminder notification for the mission owner when one does not already
    exist for the current day.
    """

    now = timezone.now()
    upcoming_deadline = now + timezone.timedelta(days=1)
    reminders_sent = 0

    missions = Mission.objects.filter(
        status="pending",
        due_date__isnull=False,
        due_date__gte=now,
        due_date__lte=upcoming_deadline,
    ).select_related("student")

    for mission in missions:
        already_sent = Notification.objects.filter(
            user=mission.student,
            type="mission_reminder",
            title=f"Mission reminder: {mission.title}",
            created_at__date=now.date(),
        ).exists()

        if already_sent:
            continue

        Notification.objects.create(
            user=mission.student,
            type="mission_reminder",
            title=f"Mission reminder: {mission.title}",
            message=(
                f"Your mission '{mission.title}' is due soon. "
                "Take a few minutes to review and complete it."
            ),
        )
        reminders_sent += 1

    logger.info("Mission reminder task completed. Sent %s reminders.", reminders_sent)
    return reminders_sent


@shared_task
def send_bereal_prompt_notification():
    """
    Send a BeReal-style prompt notification to active users.

    The task creates one notification per user for the current day, encouraging
    them to share a BeReal moment.
    """

    today = timezone.now().date()
    notifications_created = 0

    users = User.objects.filter(is_active=True)

    for user in users:
        already_sent = Notification.objects.filter(
            user=user,
            type="bereal_prompt",
            created_at__date=today,
        ).exists()

        if already_sent:
            continue

        Notification.objects.create(
            user=user,
            type="bereal_prompt",
            title="Time for your BeReal moment",
            message=(
                "Share what you are doing right now with a front and back photo "
                "to capture your authentic study moment."
            ),
        )
        notifications_created += 1

    logger.info(
        "BeReal prompt notification task completed. Created %s notifications.",
        notifications_created,
    )
    return notifications_created
