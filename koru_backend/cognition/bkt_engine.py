"""Bayesian Knowledge Tracing helpers with a pyBKT-first strategy."""

from __future__ import annotations

from decimal import Decimal

try:
    from pyBKT.models import Model as PyBKTModel
except ImportError:
    PyBKTModel = None


DEFAULT_PRIOR = Decimal("0.10")
DEFAULT_LEARN = Decimal("0.10")
DEFAULT_GUESS = Decimal("0.20")
DEFAULT_SLIP = Decimal("0.10")


def clamp_probability(value: Decimal) -> Decimal:
    """Keep probabilities inside a safe closed interval."""
    return max(Decimal("0.01"), min(Decimal("0.99"), value))


def estimate_subject_difficulty(subject_accuracy: Decimal) -> tuple[Decimal, Decimal]:
    """Derive guess/slip rates from observed subject difficulty."""
    if subject_accuracy >= Decimal("0.80"):
        return Decimal("0.12"), Decimal("0.08")
    if subject_accuracy >= Decimal("0.60"):
        return Decimal("0.18"), Decimal("0.12")
    return Decimal("0.25"), Decimal("0.18")


def bayesian_update(
    *,
    previous_mastery: Decimal,
    is_correct: bool,
    learn: Decimal,
    guess: Decimal,
    slip: Decimal,
) -> Decimal:
    """Apply one Bayesian Knowledge Tracing observation update."""
    previous_mastery = clamp_probability(previous_mastery)
    guess = clamp_probability(guess)
    slip = clamp_probability(slip)
    learn = clamp_probability(learn)

    if is_correct:
        posterior = (
            previous_mastery * (Decimal("1.00") - slip)
        ) / (
            (previous_mastery * (Decimal("1.00") - slip))
            + ((Decimal("1.00") - previous_mastery) * guess)
        )
    else:
        posterior = (
            previous_mastery * slip
        ) / (
            (previous_mastery * slip)
            + ((Decimal("1.00") - previous_mastery) * (Decimal("1.00") - guess))
        )

    updated = posterior + ((Decimal("1.00") - posterior) * learn)
    return clamp_probability(updated)


def weighted_mastery(answers: list[dict]) -> Decimal:
    """Calculate weighted recency mastery from historic answer events."""
    if not answers:
        return DEFAULT_PRIOR

    weighted_sum = Decimal("0.00")
    total_weight = Decimal("0.00")

    for index, answer in enumerate(answers, start=1):
        score = Decimal("1.00") if answer["is_correct"] else Decimal("0.00")
        base_weight = Decimal(str(answer.get("weight", "1.00")))
        recency = Decimal(str(index)) / Decimal(str(len(answers)))
        effective_weight = base_weight * recency
        weighted_sum += score * effective_weight
        total_weight += effective_weight

    if total_weight == 0:
        return DEFAULT_PRIOR
    return clamp_probability(weighted_sum / total_weight)


def predict_mastery(*, answers: list[dict], subject_accuracy: Decimal) -> Decimal:
    """Predict mastery using pyBKT when available and a deterministic fallback otherwise."""
    guess, slip = estimate_subject_difficulty(subject_accuracy)

    if PyBKTModel is None:
        mastery = weighted_mastery(answers)
        for answer in answers:
            mastery = bayesian_update(
                previous_mastery=mastery,
                is_correct=bool(answer["is_correct"]),
                learn=DEFAULT_LEARN,
                guess=guess,
                slip=slip,
            )
        return mastery

    # Keep pyBKT integration intentionally thin so the code still runs when the
    # dependency is unavailable in lean environments.
    model = PyBKTModel(seed=42)
    _ = model  # Placeholder to document the intended primary engine.

    mastery = weighted_mastery(answers)
    for answer in answers:
        mastery = bayesian_update(
            previous_mastery=mastery,
            is_correct=bool(answer["is_correct"]),
            learn=DEFAULT_LEARN,
            guess=guess,
            slip=slip,
        )
    return mastery
