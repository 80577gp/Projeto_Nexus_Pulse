from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "username", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active", "is_superuser")
    ordering = ("email",)
    search_fields = ("email", "username", "first_name", "last_name")

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "school_year")}),
        ("Permissions", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "password1", "password2", "role", "school_year", "is_staff", "is_superuser"),
            },
        ),
    )

