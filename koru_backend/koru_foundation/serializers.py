"""Serializers for the KORU foundation app."""

from rest_framework import serializers

from .models import Course, CutoffScore, Subject, Topic, TopicPrerequisite, University


class CutoffScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CutoffScore
        fields = ["id", "exam_year", "quota_category", "score", "source_label", "course"]


class CourseSerializer(serializers.ModelSerializer):
    cutoff_scores = CutoffScoreSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "university",
            "name",
            "slug",
            "campus",
            "shift",
            "degree_type",
            "cutoff_scores",
        ]


class UniversitySerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)

    class Meta:
        model = University
        fields = [
            "id",
            "name",
            "slug",
            "admission_system",
            "state_code",
            "website_url",
            "is_public",
            "courses",
        ]


class TopicPrerequisiteSerializer(serializers.ModelSerializer):
    prerequisite_name = serializers.ReadOnlyField(source="prerequisite.name")

    class Meta:
        model = TopicPrerequisite
        fields = ["id", "topic", "prerequisite", "prerequisite_name", "created_at"]
        read_only_fields = ["created_at"]


class TopicSerializer(serializers.ModelSerializer):
    prerequisite_ids = serializers.PrimaryKeyRelatedField(
        source="prerequisites",
        many=True,
        queryset=Topic.objects.all(),
        required=False,
    )
    prerequisites_detail = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            "id",
            "subject",
            "name",
            "slug",
            "description",
            "difficulty_level",
            "prerequisite_ids",
            "prerequisites_detail",
        ]

    def get_prerequisites_detail(self, obj):
        return [
            {"id": prerequisite.id, "name": prerequisite.name, "slug": prerequisite.slug}
            for prerequisite in obj.prerequisites.all()
        ]


class SubjectSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ["id", "name", "slug", "description", "topics"]
