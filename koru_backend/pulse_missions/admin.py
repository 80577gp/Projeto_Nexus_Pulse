from django.contrib import admin

from koru_backend.admin_ui import KoruAdminMixin
from .models import EffortRanking, GradeCorrelation, Mission, MissionCompletion


@admin.register(Mission)
class MissionAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("title", "student", "status", "due_date", "created_at")
    list_filter = ("status", "due_date")
    search_fields = ("title", "student__email")


@admin.register(MissionCompletion)
class MissionCompletionAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("mission", "completed_at")
    list_filter = ("completed_at",)
    search_fields = ("mission__title", "mission__student__email")


@admin.register(EffortRanking)
class EffortRankingAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("student", "weekly_score", "ranking_position", "updated_at")
    search_fields = ("student__email",)


@admin.register(GradeCorrelation)
class GradeCorrelationAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("student", "external_reference", "effort_score", "grade_score", "created_at")
    search_fields = ("student__email", "external_reference")
