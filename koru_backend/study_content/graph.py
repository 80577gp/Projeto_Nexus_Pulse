"""Neo4j graph mapping for the RAIZ academic dependency layer."""

from __future__ import annotations

from dataclasses import dataclass

try:
    from neomodel import (
        RelationshipTo,
        StringProperty,
        StructuredNode,
        UniqueIdProperty,
        config,
    )
except ImportError:
    StructuredNode = object
    RelationshipTo = None
    StringProperty = None
    UniqueIdProperty = None
    config = None

from django.conf import settings


if config is not None:
    config.DATABASE_URL = getattr(settings, "NEO4J_BOLT_URL", "bolt://neo4j:password@localhost:7687")


class _GraphFallbackMixin:
    """Provide no-op graph sync behavior when neomodel is unavailable."""

    @classmethod
    def get_or_create(cls, *_args, **_kwargs):
        return cls(), False

    def save(self, *_args, **_kwargs):
        return self

    def connect(self, *_args, **_kwargs):
        return None


def graph_supports_relationships() -> bool:
    """Return whether the live neomodel relationship manager is available."""
    return hasattr(TopicNode, "nodes") and hasattr(SkillNode, "nodes")


if StructuredNode is object:
    class TopicNode(_GraphFallbackMixin):
        pass


    class SkillNode(_GraphFallbackMixin):
        pass

else:
    class TopicNode(StructuredNode):
        """Topic node in the pedagogical graph."""

        uid = UniqueIdProperty()
        django_id = StringProperty(unique_index=True, required=True)
        name = StringProperty(required=True)
        subject_name = StringProperty(required=True)
        school_year_name = StringProperty(required=True)
        supports = RelationshipTo("SkillNode", "SUPPORTS")


    class SkillNode(StructuredNode):
        """Skill node in the pedagogical graph."""

        uid = UniqueIdProperty()
        django_id = StringProperty(unique_index=True, required=True)
        name = StringProperty(required=True)
        topic_name = StringProperty(required=True)
        subject_name = StringProperty(required=True)
        depends_on = RelationshipTo("TopicNode", "DEPENDS_ON")


@dataclass(slots=True)
class GraphSyncResult:
    """Simple response object so callers can log graph sync behavior safely."""

    synced: bool
    reason: str


def upsert_topic_node(topic) -> GraphSyncResult:
    """Mirror a relational topic into the academic graph."""
    if not hasattr(TopicNode, "get_or_create"):
        return GraphSyncResult(synced=False, reason="neomodel-unavailable")

    try:
        node, _ = TopicNode.get_or_create(
            {
                "django_id": str(topic.pk),
                "name": topic.name,
                "subject_name": topic.subject.name,
                "school_year_name": topic.subject.school_year.name,
            }
        )
        node.name = topic.name
        node.subject_name = topic.subject.name
        node.school_year_name = topic.subject.school_year.name
        node.save()
        return GraphSyncResult(synced=True, reason="topic-upserted")
    except Exception as exc:
        return GraphSyncResult(synced=False, reason=str(exc))


def upsert_skill_node(skill) -> GraphSyncResult:
    """Mirror a relational skill into the academic graph and connect it to its topic."""
    if not hasattr(SkillNode, "get_or_create"):
        return GraphSyncResult(synced=False, reason="neomodel-unavailable")

    if not graph_supports_relationships():
        return GraphSyncResult(synced=False, reason="neomodel-relationships-unavailable")

    try:
        topic_result = upsert_topic_node(skill.topic)
        skill_node, _ = SkillNode.get_or_create(
            {
                "django_id": str(skill.pk),
                "name": skill.name,
                "topic_name": skill.topic.name,
                "subject_name": skill.topic.subject.name,
            }
        )
        skill_node.name = skill.name
        skill_node.topic_name = skill.topic.name
        skill_node.subject_name = skill.topic.subject.name
        skill_node.save()

        topic_node = TopicNode.nodes.get(django_id=str(skill.topic.pk))
        skill_node.depends_on.connect(topic_node)
        topic_node.supports.connect(skill_node)

        reason = "skill-upserted" if topic_result.synced else topic_result.reason
        return GraphSyncResult(synced=True, reason=reason)
    except Exception as exc:
        return GraphSyncResult(synced=False, reason=str(exc))
