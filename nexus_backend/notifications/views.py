"""
Views for the notifications app.

This module exposes authenticated endpoints for notifications and BeReal
moments.
"""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import BeRealMoment, Notification
from .serializers import BeRealMomentSerializer, NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for notifications belonging to the authenticated user.

    Users can only access their own notifications.
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only notifications owned by the authenticated user."""
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        """Attach the authenticated user when a notification is created."""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        """Mark the selected notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response(
            {
                "message": "Notification marked as read.",
                "notification_id": notification.id,
                "is_read": notification.is_read,
            },
            status=status.HTTP_200_OK,
        )


class BeRealMomentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BeReal-style moments created by the authenticated user.

    Multipart and form parsers are enabled to support image uploads.
    """

    serializer_class = BeRealMomentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """Return only BeReal moments created by the authenticated user."""
        return BeRealMoment.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        """Attach the authenticated user when a BeReal moment is created."""
        serializer.save(user=self.request.user)

