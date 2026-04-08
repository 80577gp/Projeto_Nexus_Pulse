"""
Serializers for the core_users app.

This module contains serializers for user registration, login, profile data,
and rotating JWT actions.
"""

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import AgentActionAudit, KoruUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer used to register a new user."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = KoruUser
        fields = [
            "email",
            "username",
            "password",
            "password_confirm",
            "role",
            "school_year",
        ]
        extra_kwargs = {
            "email": {"required": True},
            "username": {"required": True},
            "role": {"required": False},
            "school_year": {"required": False},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        if attrs.get("role") == KoruUser.ROLE_ADMIN:
            raise serializers.ValidationError(
                {"role": "Public registration cannot create admin users."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        return KoruUser.objects.create_user(password=password, **validated_data)


class UserLoginSerializer(serializers.ModelSerializer):
    """Serializer used to validate login credentials."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = KoruUser
        fields = ["email", "password"]

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This user account is inactive.")

        attrs["user"] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer used to expose basic user profile information."""

    class Meta:
        model = KoruUser
        fields = [
            "email",
            "username",
            "role",
            "school_year",
            "is_non_human_identity",
            "agent_type",
            "audit_label",
        ]
        read_only_fields = ["email", "role"]


class TokenRefreshSerializer(serializers.Serializer):
    """Serializer used to rotate an incoming refresh token."""

    refresh = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    """Serializer used to revoke a refresh token."""

    refresh = serializers.CharField()


class KoruIdentitySerializer(serializers.ModelSerializer):
    """Serializer for human and non-human identities managed by admins."""

    class Meta:
        model = KoruUser
        fields = [
            "id",
            "email",
            "username",
            "role",
            "school_year",
            "is_non_human_identity",
            "agent_type",
            "audit_label",
            "is_active",
            "is_staff",
            "date_joined",
        ]
        read_only_fields = ["date_joined"]


class AgentActionAuditSerializer(serializers.ModelSerializer):
    """Serializer for AI agent audit trail entries."""

    actor_email = serializers.ReadOnlyField(source="actor.email")

    class Meta:
        model = AgentActionAudit
        fields = [
            "id",
            "actor",
            "actor_email",
            "action",
            "target_resource",
            "request_id",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["request_id", "created_at"]
