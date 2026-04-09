from django.contrib import admin

from koru_backend.admin_ui import KoruAdminMixin, KoruTabularInline
from .models import Course, CutoffScore, Subject, Topic, TopicPrerequisite, University


@admin.register(University)
class UniversityAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("name", "admission_system", "state_code", "is_public")
    search_fields = ("name", "slug")


@admin.register(Course)
class CourseAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("name", "university", "campus", "degree_type")
    list_select_related = ("university",)
    search_fields = ("name", "campus", "university__name")
    autocomplete_fields = ("university",)


@admin.register(CutoffScore)
class CutoffScoreAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("course", "exam_year", "quota_category", "score")
    list_select_related = ("course", "course__university")
    search_fields = ("course__name", "course__university__name", "quota_category")
    autocomplete_fields = ("course",)
    fieldsets = (
        ("Course context", {"fields": ("course",)}),
        ("Exam snapshot", {"fields": ("exam_year", "quota_category", "score")}),
        ("Source trace", {"fields": ("source_label",)}),
    )


class TopicPrerequisiteInline(KoruTabularInline):
    model = TopicPrerequisite
    fk_name = "topic"
    autocomplete_fields = ("prerequisite",)
    extra = 1


@admin.register(Subject)
class SubjectAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")


@admin.register(Topic)
class TopicAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("name", "subject", "difficulty_level")
    list_select_related = ("subject",)
    search_fields = ("name", "slug", "subject__name", "prerequisites__name", "unlocks__name")
    autocomplete_fields = ("subject",)
    inlines = [TopicPrerequisiteInline]
