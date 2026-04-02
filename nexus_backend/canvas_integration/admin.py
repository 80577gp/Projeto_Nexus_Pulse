from django.contrib import admin

from .models import CanvasAssignment, CanvasCourse, CanvasGrade, CanvasIntegration


@admin.register(CanvasIntegration)
class CanvasIntegrationAdmin(admin.ModelAdmin):
    list_display = ("user", "canvas_user_id", "token_expires_at", "updated_at")
    search_fields = ("user__email", "canvas_user_id")


@admin.register(CanvasCourse)
class CanvasCourseAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "canvas_course_id", "enrollment_state")
    list_filter = ("enrollment_state",)
    search_fields = ("name", "course_code", "user__email")


@admin.register(CanvasAssignment)
class CanvasAssignmentAdmin(admin.ModelAdmin):
    list_display = ("name", "course", "due_date", "points_possible")
    list_filter = ("course",)
    search_fields = ("name", "course__name")


@admin.register(CanvasGrade)
class CanvasGradeAdmin(admin.ModelAdmin):
    list_display = ("user", "assignment", "score", "grade", "graded_at")
    list_filter = ("graded_at",)
    search_fields = ("user__email", "assignment__name")

