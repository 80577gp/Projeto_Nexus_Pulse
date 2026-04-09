from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.db.models import Count, Q

from koru_backend.admin_ui import KoruAdminMixin
from .models import AgentActionAudit, KoruUser, RefreshSession


class PremiumStatusFilter(admin.SimpleListFilter):
    title = "premium"
    parameter_name = "is_premium"

    def lookups(self, request, model_admin):
        return (("yes", "Premium"), ("no", "Standard"))

    def queryset(self, request, queryset):
        premium_users = queryset.filter(groups__name__iexact="premium")
        if self.value() == "yes":
            return premium_users
        if self.value() == "no":
            return queryset.exclude(pk__in=premium_users.values("pk"))
        return queryset


@admin.register(KoruUser)
class KoruUserAdmin(KoruAdminMixin, DjangoUserAdmin):
    list_display = (
        "email",
        "role",
        "school_year",
        "is_premium",
    )
    list_filter = (
        "role",
        "school_year",
        PremiumStatusFilter,
    )
    ordering = ("email",)
    search_fields = ("email", "username", "first_name", "last_name")
    list_select_related = ()

    fieldsets = (
        ("Identity", {"fields": ("email", "username", "password", "role")}),
        (
            "Learning profile",
            {"fields": ("first_name", "last_name", "school_year", "audit_label")},
        ),
        (
            "Agent identity",
            {"fields": ("is_non_human_identity", "agent_type")},
        ),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Lifecycle", {"fields": ("last_login", "date_joined")}),
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

    @admin.display(boolean=True, description="Premium")
    def is_premium(self, obj):
        premium_count = getattr(obj, "_premium_count", None)
        if premium_count is not None:
            return premium_count > 0
        return obj.groups.filter(name__iexact="premium").exists()

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(
            _premium_count=Count(
                "groups",
                filter=Q(groups__name__iexact="premium"),
                distinct=True,
            )
        )


@admin.register(RefreshSession)
class RefreshSessionAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("user", "token_jti", "family_id", "expires_at", "revoked_at")
    list_filter = ("revoked_at", "expires_at")
    search_fields = ("user__email", "token_jti", "family_id")
    autocomplete_fields = ("user",)


@admin.register(AgentActionAudit)
class AgentActionAuditAdmin(KoruAdminMixin, admin.ModelAdmin):
    list_display = ("actor", "action", "target_resource", "request_id", "created_at")
    list_select_related = ("actor",)
    search_fields = ("actor__email", "action", "target_resource", "request_id")
    autocomplete_fields = ("actor",)
