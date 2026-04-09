"""Signal hooks that keep RAIZ mastery state synchronized."""

from decimal import Decimal

from django.db.models.signals import post_save
from django.dispatch import receiver

from cognition.bkt_engine import predict_mastery

from .models import StudentAnswer, StudentProgress


@receiver(post_save, sender=StudentAnswer)
def update_student_progress_from_answer(sender, instance, created, **kwargs):
    """Refresh mastery after each submitted diagnostic answer."""
    if not created:
        return

    related_skill = instance.question.test.related_skill
    subject = related_skill.topic.subject

    skill_answers = (
        StudentAnswer.objects.select_related(
            "question__test__related_skill__topic__subject"
        )
        .filter(
            student=instance.student,
            question__test__related_skill=related_skill,
        )
        .order_by("answered_at", "id")
    )

    subject_answers = StudentAnswer.objects.filter(
        question__test__related_skill__topic__subject=subject
    )
    total_subject_answers = subject_answers.count()
    correct_subject_answers = subject_answers.filter(is_correct=True).count()
    if total_subject_answers == 0:
        subject_accuracy = Decimal("0.50")
    else:
        subject_accuracy = Decimal(correct_subject_answers) / Decimal(total_subject_answers)

    skill_correct_answers = skill_answers.filter(is_correct=True).count()
    skill_total_answers = skill_answers.count()
    if skill_total_answers == 0:
        historic_difficulty = Decimal("0.50")
    else:
        skill_accuracy = Decimal(skill_correct_answers) / Decimal(skill_total_answers)
        historic_difficulty = Decimal("1.00") - skill_accuracy

    mastery = predict_mastery(
        answers=[
            {
                "is_correct": answer.is_correct,
                "weight": "1.00",
            }
            for answer in skill_answers
        ],
        subject_accuracy=subject_accuracy,
        historic_difficulty=historic_difficulty,
    )

    StudentProgress.objects.update_or_create(
        student=instance.student,
        skill=related_skill,
        defaults={
            "mastery_level": (mastery * Decimal("100.00")).quantize(Decimal("0.01")),
            "completed": True,
        },
    )
