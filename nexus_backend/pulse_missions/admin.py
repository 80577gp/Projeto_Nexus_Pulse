from django.contrib import admin

from .models import EffortRanking, GradeCorrelation, Mission, MissionCompletion


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ("title", "student", "status", "due_date", "created_at")
    list_filter = ("status", "due_date")
    search_fields = ("title", "student__email")


@admin.register(MissionCompletion)
class MissionCompletionAdmin(admin.ModelAdmin):
    list_display = ("mission", "completed_at")
    list_filter = ("completed_at",)
    search_fields = ("mission__title", "mission__student__email")


@admin.register(EffortRanking)
class EffortRankingAdmin(admin.ModelAdmin):
    list_display = ("student", "weekly_score", "ranking_position", "updated_at")
    search_fields = ("student__email",)


@admin.register(GradeCorrelation)
class GradeCorrelationAdmin(admin.ModelAdmin):
    list_display = ("student", "canvas_assignment", "effort_score", "grade_score", "created_at")
    search_fields = ("student__email", "canvas_assignment__name")

