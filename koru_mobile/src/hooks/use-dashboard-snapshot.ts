import { useEffect, useState } from "react";

import { mobileApiClient } from "@/services/api/mobile-api-client";
import { useStudyCacheStore } from "@/stores/study-cache-store";

type DashboardSnapshot = {
  mastery: number;
  masteredTopics: number;
  totalTopics: number;
  deepScanAlert: string;
  recoveryFocus: string;
  targetUniversity: string;
  targetDelta: number;
  focusMinutes: number;
};

const fallbackSnapshot: DashboardSnapshot = {
  mastery: 0.64,
  masteredTopics: 18,
  totalTopics: 28,
  deepScanAlert: "Foundational gap detected in stoichiometry before reaction balancing.",
  recoveryFocus: "Rebuild molar ratios and symbolic conversion chains.",
  targetUniversity: "FUVEST Medicina",
  targetDelta: -52,
  focusMinutes: 42,
};

export function useDashboardSnapshot() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const cacheTopics = useStudyCacheStore((state) => state.cacheTopics);
  const updateMastery = useStudyCacheStore((state) => state.updateMastery);

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshot() {
      try {
        const [topicsResponse, progressResponse] = await Promise.all([
          mobileApiClient.get("/foundation/topics/"),
          mobileApiClient.get("/diagnostics/student-progress/"),
        ]);

        const topics = Array.isArray(topicsResponse.data) ? topicsResponse.data : [];
        const progressEntries = Array.isArray(progressResponse.data)
          ? progressResponse.data
          : [];

        const normalizedTopics = topics.map((topic) => ({
          id: Number(topic.id),
          name: String(topic.name),
          subjectId: Number(topic.subject),
        }));

        const totalTopics = normalizedTopics.length || fallbackSnapshot.totalTopics;
        const masteryValues = progressEntries
          .map((entry) => Number(entry.mastery_level))
          .filter((value) => Number.isFinite(value));
        const averageMastery = masteryValues.length
          ? masteryValues.reduce((sum, value) => sum + value, 0) / masteryValues.length / 100
          : fallbackSnapshot.mastery;
        const masteredTopics = progressEntries.length
          ? masteryValues.filter((value) => value >= 70).length
          : fallbackSnapshot.masteredTopics;

        progressEntries.forEach((entry) => {
          if (entry.skill != null && entry.mastery_level != null) {
            updateMastery(`skill:${entry.skill}`, Number(entry.mastery_level) / 100);
          }
        });

        if (!cancelled) {
          cacheTopics(normalizedTopics);
          setSnapshot({
            ...fallbackSnapshot,
            mastery: Number(averageMastery.toFixed(2)),
            masteredTopics,
            totalTopics,
          });
        }
      } catch {
        if (!cancelled) {
          setTimeout(() => {
            setSnapshot(fallbackSnapshot);
          }, 900);
        }
      } finally {
        if (!cancelled) {
          setTimeout(() => setLoading(false), 1000);
        }
      }
    }

    loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, loading };
}
