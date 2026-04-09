from django.contrib import admin

from koru_backend.admin_ui import KoruAdminMixin
from .models import BeRealMoment, Notification


@admin.register(Notification)
class NotificationAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("title", "user", "type", "is_read", "created_at")
    list_filter = ("type", "is_read", "created_at")
    search_fields = ("title", "message", "user__email")


@admin.register(BeRealMoment)
class BeRealMomentAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("user", "caption", "created_at")
    search_fields = ("caption", "user__email")
