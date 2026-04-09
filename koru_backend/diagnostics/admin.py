from django.contrib import admin

from koru_backend.admin_ui import KoruAdminMixin, KoruTabularInline
from .models import Choice, DiagnosticTest, Question, StudentAnswer, StudentProgress


class ChoiceInline(KoruTabularInline):
    model = Choice
    extra = 1


class QuestionInline(KoruTabularInline):
    model = Question
    extra = 1


@admin.register(DiagnosticTest)
class DiagnosticTestAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("name", "related_skill", "version")
    search_fields = ("name", "description", "related_skill__name", "related_skill__topic__name")
    list_filter = ("related_skill",)
    inlines = [QuestionInline]
    autocomplete_fields = ("related_skill",)
    fieldsets = (
        ("Diagnostic identity", {"fields": ("name", "description", "version")}),
        ("Knowledge mapping", {"fields": ("related_skill", "bkt_skill_key")}),
    )


@admin.register(Question)
class QuestionAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("test", "order", "question_type")
    list_filter = ("test", "question_type")
    search_fields = ("text",)
    inlines = [ChoiceInline]
    autocomplete_fields = ("test",)


@admin.register(StudentAnswer)
class StudentAnswerAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("student", "question", "chosen_choice", "is_correct", "answered_at")
    list_filter = ("is_correct", "answered_at")
    search_fields = ("student__email", "question__text")
    autocomplete_fields = ("student", "question")


@admin.register(StudentProgress)
class StudentProgressAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("student", "skill", "mastery_level", "completed", "last_evaluated")
    list_filter = ("completed", "last_evaluated")
    search_fields = ("student__email", "skill__name")
    autocomplete_fields = ("student", "skill")
