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


class AgentActionAuditViewSet(ReadOnlyModelViewSet):
    """Inspect immutable audit events emitted by agent identities."""

    queryset = AgentActionAudit.objects.select_related("actor").all()
    serializer_class = AgentActionAuditSerializer
    permission_classes = [IsAdminUser]
