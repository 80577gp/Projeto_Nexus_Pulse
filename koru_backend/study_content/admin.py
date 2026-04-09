import importlib.util

from django.contrib import admin
from django.db.models import Avg

from koru_backend.admin_ui import KoruAdminMixin, KoruTabularInline
from .graph import graph_supports_relationships
from .models import Content, SchoolYear, Skill, Subject, Topic


class SkillInline(KoruTabularInline):
    model = Skill
    fields = ("name",)


@admin.register(SchoolYear)
class SchoolYearAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Subject)
class SubjectAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("name", "school_year")
    list_filter = ("school_year",)
    search_fields = ("name",)
    autocomplete_fields = ("school_year",)


@admin.register(Topic)
class TopicAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("name", "subject", "average_mastery_level", "graph_relationships")
    list_filter = ("subject", "subject__school_year")
    search_fields = ("name", "subject__name", "skills__name")
    autocomplete_fields = ("subject",)
    inlines = [SkillInline]
    readonly_fields = ("graph_sync_status", "graph_relationships")
    fieldsets = (
        ("Topic identity", {"fields": ("name", "subject")}),
        (
            "Knowledge graph",
            {"fields": ("graph_sync_status", "graph_relationships")},
        ),
    )

    @admin.display(description="Avg mastery")
    def average_mastery_level(self, obj):
        value = getattr(obj, "average_mastery", None)
        return f"{value:.2f}%" if value is not None else "No mastery data"

    @admin.display(description="Graph map")
    def graph_relationships(self, obj):
        if not obj.pk:
            return "Save the topic to inspect graph relationships."
        skill_count = obj.skills.count()
        return f"{skill_count} linked skill node(s)"

    @admin.display(description="Graph status")
    def graph_sync_status(self, obj):
        if not obj.pk:
            return "Pending save before graph sync."
        if importlib.util.find_spec("neomodel") is None:
            return "Neo4j sync dependency not installed; relational admin fallback is active."
        if not graph_supports_relationships():
            return "Neo4j available, but live relationship managers are not active."
        return "Neo4j topic/skill relationship mapping is active."

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("subject").annotate(
            average_mastery=Avg("skills__student_progress__mastery_level")
        )


@admin.register(Skill)
class SkillAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("name", "topic", "average_mastery_level")
    list_filter = ("topic", "topic__subject")
    search_fields = ("name", "topic__name", "topic__subject__name")
    autocomplete_fields = ("topic",)

    @admin.display(description="Avg mastery")
    def average_mastery_level(self, obj):
        value = getattr(obj, "average_mastery", None)
        return f"{value:.2f}%" if value is not None else "No mastery data"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("topic", "topic__subject").annotate(
            average_mastery=Avg("student_progress__mastery_level")
        )


@admin.register(Content)
class ContentAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("title", "content_type", "skill", "semantic_source_hash")
    list_filter = ("content_type", "skill")
    search_fields = ("title", "description", "skill__name", "skill__topic__name")
    autocomplete_fields = ("skill",)
