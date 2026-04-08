from django.db import migrations, models

try:
    from pgvector.django import VectorField as PGVectorField
except ImportError:
    class PGVectorField(models.JSONField):
        def __init__(self, *args, dimensions=None, **kwargs):
            super().__init__(*args, **kwargs)


class Migration(migrations.Migration):

    dependencies = [
        ("study_content", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="content",
            name="semantic_embedding",
            field=PGVectorField(
                blank=True,
                null=True,
                help_text="Embedding used for semantic retrieval in the RAIZ RAG layer.",
            ),
        ),
        migrations.AddField(
            model_name="content",
            name="semantic_source_hash",
            field=models.CharField(
                blank=True,
                max_length=64,
                help_text="Stable hash of the content payload used to detect stale embeddings.",
            ),
        ),
    ]
