"""Administrative viewsets for human and non-human identities."""

from rest_framework.permissions import IsAdminUser
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from .models import AgentActionAudit, KoruUser
from .serializers import AgentActionAuditSerializer, KoruIdentitySerializer


class KoruIdentityViewSet(ModelViewSet):
    """Manage human and agent identities through the DRF admin surface."""

    queryset = KoruUser.objects.all().order_by("-date_joined")
    serializer_class = KoruIdentitySerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        identity_type = self.request.query_params.get("identity_type")
        if identity_type == "nhi":
            return queryset.filter(is_non_human_identity=True)
        if identity_type == "human":
            return queryset.filter(is_non_human_identity=False)
        return queryset

    def _emit_audit(self, *, action: str, target: KoruUser):
        actor = getattr(self.request, "user", None)
        if not getattr(actor, "is_authenticated", False):
            return

        metadata = {
            "http_method": self.request.method,
            "identity_id": target.pk,
            "identity_type": "nhi" if target.is_non_human_identity else "human",
            "agent_type": target.agent_type,
        }

        AgentActionAudit.objects.create(
            actor=actor,
            action=action,
            target_resource=f"identity:{target.pk}",
            metadata=metadata,
        )

    def perform_create(self, serializer):
        identity = serializer.save()
        self._emit_audit(action="identity.create", target=identity)

    def perform_update(self, serializer):
        identity = serializer.save()
        self._emit_audit(action="identity.update", target=identity)

    def perform_destroy(self, instance):
        self._emit_audit(action="identity.delete", target=instance)
        instance.delete()


class AgentActionAuditViewSet(ReadOnlyModelViewSet):
    """Inspect immutable audit events emitted by agent identities."""

    queryset = AgentActionAudit.objects.select_related("actor").all()
    serializer_class = AgentActionAuditSerializer
    permission_classes = [IsAdminUser]
