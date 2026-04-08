from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("core_users", "0002_refreshsession"),
    ]

    operations = [
        migrations.AddField(
            model_name="koruuser",
            name="agent_type",
            field=models.CharField(
                choices=[
                    ("none", "None"),
                    ("deepscan", "DeepScan"),
                    ("guide", "Guide"),
                    ("rag", "RAG"),
                ],
                default="none",
                help_text="Declares the agent persona linked to this identity.",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="koruuser",
            name="audit_label",
            field=models.CharField(
                blank=True,
                help_text="Human-readable label for audit trails.",
                max_length=120,
            ),
        ),
        migrations.AddField(
            model_name="koruuser",
            name="is_non_human_identity",
            field=models.BooleanField(
                default=False,
                help_text="Identifies service accounts used by AI agents and automations.",
            ),
        ),
        migrations.CreateModel(
            name="AgentActionAudit",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(max_length=120)),
                ("target_resource", models.CharField(max_length=255)),
                ("request_id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("actor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="agent_audit_events", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
