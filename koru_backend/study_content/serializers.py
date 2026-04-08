"""
Serializers for the study_content app.

This module defines DRF serializers for the educational content hierarchy.
"""

from rest_framework import serializers

from .models import Content, SchoolYear, Skill, Subject, Topic


class SchoolYearSerializer(serializers.ModelSerializer):
    """Serializer for the SchoolYear model."""

    class Meta:
        model = SchoolYear
        fields = ["id", "name"]


class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for the Subject model.

    Includes the school_year foreign key as an ID field.
    """

    class Meta:
        model = Subject
        fields = ["id", "name", "school_year"]


class TopicSerializer(serializers.ModelSerializer):
    """
    Serializer for the Topic model.

    Includes the subject foreign key as an ID field.
    """

    class Meta:
        model = Topic
        fields = ["id", "name", "subject"]


class SkillSerializer(serializers.ModelSerializer):
    """
    Serializer for the Skill model.

    Includes the topic foreign key as an ID field.
    """

    class Meta:
        model = Skill
        fields = ["id", "name", "topic"]


class ContentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Content model.

    Includes all fields, including the related skill foreign key.
    """

    class Meta:
        model = Content
        fields = "__all__"

