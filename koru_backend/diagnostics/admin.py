from django.contrib import admin

from .models import Choice, DiagnosticTest, Question, StudentAnswer, StudentProgress


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 1


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(DiagnosticTest)
class DiagnosticTestAdmin(admin.ModelAdmin):
    list_display = ("name", "related_skill")
    search_fields = ("name", "description")
    list_filter = ("related_skill",)
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("test", "order", "question_type")
    list_filter = ("test", "question_type")
    search_fields = ("text",)
    inlines = [ChoiceInline]


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ("student", "question", "chosen_choice", "is_correct", "answered_at")
    list_filter = ("is_correct", "answered_at")
    search_fields = ("student__email", "question__text")


@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ("student", "skill", "mastery_level", "completed", "last_evaluated")
    list_filter = ("completed", "last_evaluated")
    search_fields = ("student__email", "skill__name")

