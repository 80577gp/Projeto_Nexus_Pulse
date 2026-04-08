from django.contrib import admin

from .models import Content, SchoolYear, Skill, Subject, Topic


@admin.register(SchoolYear)
class SchoolYearAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "school_year")
    list_filter = ("school_year",)
    search_fields = ("name",)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("name", "subject")
    list_filter = ("subject", "subject__school_year")
    search_fields = ("name",)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "topic")
    list_filter = ("topic", "topic__subject")
    search_fields = ("name",)


@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ("title", "content_type", "skill", "semantic_source_hash")
    list_filter = ("content_type", "skill")
    search_fields = ("title", "description")
