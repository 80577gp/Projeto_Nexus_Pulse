"""Shared admin UI helpers for the KORU back office."""

from django.contrib import admin


class KoruAdminMixin:
    """Apply the KORU admin look-and-feel and shared ergonomics."""

    list_per_page = 20
    save_on_top = True

    class Media:
        css = {"all": ("admin/css/koru-admin.css",)}


class KoruTabularInline(admin.TabularInline):
    """Inline variant that keeps the same KORU admin styling defaults."""

    extra = 0
    show_change_link = True

    class Media:
        css = {"all": ("admin/css/koru-admin.css",)}

