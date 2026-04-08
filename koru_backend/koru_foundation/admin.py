from django.contrib import admin

from .models import Course, CutoffScore, Subject, Topic, TopicPrerequisite, University


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ("name", "admission_system", "state_code", "is_public")
    search_fields = ("name", "slug")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "university", "campus", "degree_type")
    list_select_related = ("university",)
    search_fields = ("name", "campus", "university__name")


@admin.register(CutoffScore)
class CutoffScoreAdmin(admin.ModelAdmin):
    list_display = ("course", "exam_year", "quota_category", "score")
    list_select_related = ("course", "course__university")
    search_fields = ("course__name", "course__university__name", "quota_category")


class TopicPrerequisiteInline(admin.TabularInline):
    model = TopicPrerequisite
    fk_name = "topic"
    autocomplete_fields = ("prerequisite",)
    extra = 1


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("name", "subject", "difficulty_level")
    list_select_related = ("subject",)
    search_fields = ("name", "subject__name")
    inlines = [TopicPrerequisiteInline]
