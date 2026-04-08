"""
Small Celery compatibility layer for local environments without Celery installed.
"""

try:
    from celery import shared_task as real_shared_task

    shared_task = real_shared_task
except ImportError:
    def shared_task(func=None, *decorator_args, **decorator_kwargs):
        """Fallback decorator that preserves a Celery-like `.delay()` API."""
        def decorator(target):
            def delay(*args, **kwargs):
                return target(*args, **kwargs)

            target.delay = delay
            target.apply_async = delay
            return target

        if func and callable(func):
            return decorator(func)
        return decorator

