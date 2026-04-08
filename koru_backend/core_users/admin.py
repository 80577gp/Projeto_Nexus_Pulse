from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import AgentActionAudit, KoruUser, RefreshSession


@admin.register(KoruUser)
class KoruUserAdmin(DjangoUserAdmin):
    list_display = (
        "email",
        "username",
        "role",
        "agent_type",
        "is_non_human_identity",
        "is_staff",
        "is_active",
    )
    list_filter = (
        "role",
        "agent_type",
        "is_non_human_identity",
        "is_staff",
        "is_active",
        "is_superuser",
    )
    ordering = ("email",)
    search_fields = ("email", "username", "first_name", "last_name")

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            "Personal info",
            {"fields": ("first_name", "last_name", "school_year", "audit_label")},
        ),
        (
            "Identity type",
            {"fields": ("is_non_human_identity", "agent_type")},
        ),
        ("Permissions", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "password1",
                    "password2",
                    "role",
                    "school_year",
                    "audit_label",
                    "is_non_human_identity",
                    "agent_type",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )


@admin.register(RefreshSession)
class RefreshSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "token_jti", "family_id", "expires_at", "revoked_at")
    list_filter = ("revoked_at", "expires_at")
    search_fields = ("user__email", "token_jti", "family_id")
    autocomplete_fields = ("user",)


@admin.register(AgentActionAudit)
class AgentActionAuditAdmin(admin.ModelAdmin):
    list_display = ("actor", "action", "target_resource", "request_id", "created_at")
    list_select_related = ("actor",)
    search_fields = ("actor__email", "action", "target_resource", "request_id")
    autocomplete_fields = ("actor",)
