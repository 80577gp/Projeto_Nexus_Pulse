from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("diagnostics", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="diagnostictest",
            name="version",
            field=models.PositiveIntegerField(
                default=1,
                help_text="Version number used to preserve diagnostic test evolution.",
            ),
        ),
        migrations.AddField(
            model_name="diagnostictest",
            name="bkt_skill_key",
            field=models.CharField(
                blank=True,
                help_text="Stable identifier consumed by the BKT engine and graph layer.",
                max_length=160,
            ),
        ),
    ]
