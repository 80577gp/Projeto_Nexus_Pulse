import { useEffect, useState } from "react";

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

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshot() {
      try {
        const baseUrl =
          process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
        const response = await fetch(`${baseUrl}/foundation/universities/`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard snapshot.");
        }

        await response.json();

        if (!cancelled) {
          setSnapshot(fallbackSnapshot);
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
