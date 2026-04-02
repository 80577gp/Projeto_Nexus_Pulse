"""
Serializers for the core_users app.

This module contains serializers for user registration, login, and profile data.
"""

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer used to register a new user.

    Includes password confirmation and creates the user with a hashed password.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
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
        """Ensure both password fields match before creating the user."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        if attrs.get("role") == User.ROLE_ADMIN:
            raise serializers.ValidationError(
                {"role": "Public registration cannot create admin users."}
            )
        return attrs

    def create(self, validated_data):
        """Create a new user using the custom manager."""
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class UserLoginSerializer(serializers.ModelSerializer):
    """
    Serializer used to validate login credentials.

    Authenticates the user by email and password.
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["email", "password"]

    def validate(self, attrs):
        """Authenticate the user and return the validated attributes."""
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError(
                "Both email and password are required."
            )

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
        model = User
        fields = ["email", "username", "role", "school_year"]
        read_only_fields = ["email", "role"]
