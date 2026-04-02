"""
Serializers for the notifications app.

This module defines DRF serializers for user notifications and BeReal moments.
"""

from rest_framework import serializers

from .models import BeRealMoment, Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for notification objects.

    The related user is exposed as a read-only value so it is not overwritten by
    incoming requests.
    """

    user = serializers.ReadOnlyField(source="user.id")

    class Meta:
        model = Notification
        fields = "__all__"


class BeRealMomentSerializer(serializers.ModelSerializer):
    """
    Serializer for BeReal-style moment posts.

    Includes the user and both camera images together with the caption and
    timestamps.
    """

    class Meta:
        model = BeRealMoment
        fields = [
            "id",
            "user",
            "front_image",
            "back_image",
            "caption",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

