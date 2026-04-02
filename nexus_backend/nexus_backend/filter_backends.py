"""
Fallback filter backend used when django-filter is unavailable.
"""

try:
    from django_filters.rest_framework import DjangoFilterBackend as RealDjangoFilterBackend

    DjangoFilterBackend = RealDjangoFilterBackend
except ImportError:
    class DjangoFilterBackend:
        """No-op fallback backend that leaves the queryset unchanged."""

        def filter_queryset(self, request, queryset, view):
            return queryset

        def get_schema_operation_parameters(self, view):
            return []

