from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="University",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150, unique=True)),
                ("slug", models.SlugField(max_length=160, unique=True)),
                ("admission_system", models.CharField(choices=[("sisu", "SISU"), ("fuvest", "FUVEST"), ("enem", "ENEM"), ("proprio", "Processo Proprio")], default="sisu", max_length=20)),
                ("state_code", models.CharField(blank=True, max_length=2)),
                ("website_url", models.URLField(blank=True)),
                ("is_public", models.BooleanField(default=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Subject",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120, unique=True)),
                ("slug", models.SlugField(max_length=140, unique=True)),
                ("description", models.TextField(blank=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Course",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150)),
                ("slug", models.SlugField(max_length=160)),
                ("campus", models.CharField(blank=True, max_length=150)),
                ("shift", models.CharField(blank=True, max_length=50)),
                ("degree_type", models.CharField(choices=[("bachelor", "Bacharelado"), ("licenciatura", "Licenciatura"), ("tecnologo", "Tecnologo")], default="bachelor", max_length=20)),
                ("university", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="courses", to="koru_foundation.university")),
            ],
            options={"ordering": ["name", "campus"], "unique_together": {("university", "slug", "campus")}},
        ),
        migrations.CreateModel(
            name="Topic",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150)),
                ("slug", models.SlugField(max_length=160)),
                ("description", models.TextField(blank=True)),
                ("difficulty_level", models.PositiveSmallIntegerField(default=1)),
                ("subject", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="topics", to="koru_foundation.subject")),
            ],
            options={"ordering": ["subject__name", "name"], "unique_together": {("subject", "slug")}},
        ),
        migrations.CreateModel(
            name="CutoffScore",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("exam_year", models.PositiveIntegerField()),
                ("quota_category", models.CharField(default="ampla_concorrencia", max_length=120)),
                ("score", models.DecimalField(decimal_places=2, max_digits=6)),
                ("source_label", models.CharField(blank=True, max_length=120)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="cutoff_scores", to="koru_foundation.course")),
            ],
            options={"ordering": ["-exam_year", "-score"], "unique_together": {("course", "exam_year", "quota_category")}},
        ),
        migrations.CreateModel(
            name="TopicPrerequisite",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("prerequisite", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="required_for", to="koru_foundation.topic")),
                ("topic", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="topic_prerequisites", to="koru_foundation.topic")),
            ],
            options={"unique_together": {("topic", "prerequisite")}},
        ),
        migrations.AddField(
            model_name="topic",
            name="prerequisites",
            field=models.ManyToManyField(blank=True, related_name="unlocks", through="koru_foundation.TopicPrerequisite", to="koru_foundation.topic"),
        ),
    ]
