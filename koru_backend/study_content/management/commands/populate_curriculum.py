"""
Management command to populate the curriculum structure for the study_content app.

This command creates school years, subjects, topics, and skills using a nested
data structure and `get_or_create` to avoid duplicates.
"""

from django.core.management.base import BaseCommand

from study_content.models import SchoolYear, Skill, Subject, Topic


CURRICULUM_DATA = {
    "9o Ano": {
        "Matematica": {
            "Algebra": [
                "Resolver equacoes do 1o grau",
                "Interpretar expressoes algebricas",
            ],
            "Geometria": [
                "Calcular area de figuras planas",
                "Identificar angulos e poligonos",
            ],
        },
        "Ciencias": {
            "Materia e Energia": [
                "Diferenciar estados fisicos da materia",
                "Reconhecer fontes de energia",
            ],
            "Ecologia": [
                "Analisar cadeias alimentares",
                "Identificar impactos ambientais",
            ],
        },
    },
    "1a Serie EM": {
        "Matematica": {
            "Funcoes": [
                "Identificar funcao afim",
                "Interpretar grafico de funcoes",
            ],
            "Estatistica": [
                "Calcular media, moda e mediana",
                "Interpretar tabelas e graficos",
            ],
        },
        "Lingua Portuguesa": {
            "Leitura e Interpretacao": [
                "Identificar tese e argumentos",
                "Reconhecer generos textuais",
            ],
            "Producao Textual": [
                "Planejar redacao dissertativa",
                "Aplicar coesao e coerencia",
            ],
        },
    },
}


class Command(BaseCommand):
    """Populate the study content curriculum tree with initial sample data."""

    help = "Populate SchoolYear, Subject, Topic, and Skill with curriculum data."

    def handle(self, *args, **options):
        """Create the curriculum hierarchy using get_or_create at each level."""
        self.stdout.write(self.style.NOTICE("Starting curriculum population..."))

        created_school_years = 0
        created_subjects = 0
        created_topics = 0
        created_skills = 0

        for school_year_name, subjects in CURRICULUM_DATA.items():
            school_year, school_year_created = SchoolYear.objects.get_or_create(
                name=school_year_name
            )
            if school_year_created:
                created_school_years += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created school year: {school_year_name}")
                )
            else:
                self.stdout.write(f"School year already exists: {school_year_name}")

            for subject_name, topics in subjects.items():
                subject, subject_created = Subject.objects.get_or_create(
                    name=subject_name,
                    school_year=school_year,
                )
                if subject_created:
                    created_subjects += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  Created subject: {subject_name} ({school_year_name})"
                        )
                    )
                else:
                    self.stdout.write(
                        f"  Subject already exists: {subject_name} ({school_year_name})"
                    )

                for topic_name, skills in topics.items():
                    topic, topic_created = Topic.objects.get_or_create(
                        name=topic_name,
                        subject=subject,
                    )
                    if topic_created:
                        created_topics += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"    Created topic: {topic_name} ({subject_name})"
                            )
                        )
                    else:
                        self.stdout.write(
                            f"    Topic already exists: {topic_name} ({subject_name})"
                        )

                    for skill_name in skills:
                        _, skill_created = Skill.objects.get_or_create(
                            name=skill_name,
                            topic=topic,
                        )
                        if skill_created:
                            created_skills += 1
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f"      Created skill: {skill_name}"
                                )
                            )
                        else:
                            self.stdout.write(
                                f"      Skill already exists: {skill_name}"
                            )

        self.stdout.write(self.style.NOTICE("Curriculum population finished."))
        self.stdout.write(
            self.style.SUCCESS(
                (
                    f"Summary: {created_school_years} school years, "
                    f"{created_subjects} subjects, "
                    f"{created_topics} topics, "
                    f"{created_skills} skills created."
                )
            )
        )

