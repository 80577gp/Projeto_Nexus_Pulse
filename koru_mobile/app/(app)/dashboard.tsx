import { Text, View } from "react-native";

import { BentoCard } from "@/components/dashboard/bento-card";
import { SpiralMastery } from "@/components/dashboard/spiral-mastery";
import { SkeletonCard } from "@/components/feedback/skeleton-card";
import { useDashboardSnapshot } from "@/hooks/use-dashboard-snapshot";
import { useResponsive } from "@/providers/responsive-provider";

export default function DashboardScreen() {
  const { loading, snapshot } = useDashboardSnapshot();
  const { isDesktop } = useResponsive();

  return (
    <View className="flex-1 bg-surface">
      <View className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 md:py-8">
        <Text className="font-heading text-4xl text-primary">KORU Dashboard</Text>
        <Text className="mt-3 max-w-3xl font-ui text-base leading-7 text-primary/70">
          A luxury bento command center for mastery, remediation, admissions trajectory, and deep work rhythm.
        </Text>

        <View className={`mt-8 gap-4 ${isDesktop ? "flex-row" : ""}`}>
          <View className={`${isDesktop ? "flex-[1.55]" : ""} gap-4`}>
            {loading || !snapshot ? (
              <SkeletonCard height={420} />
            ) : (
              <SpiralMastery
                mastery={snapshot.mastery}
                masteredTopics={snapshot.masteredTopics}
                totalTopics={snapshot.totalTopics}
              />
            )}
          </View>

          <View className={`${isDesktop ? "flex-1" : ""} gap-4`}>
            {loading || !snapshot ? (
              <>
                <SkeletonCard height={190} />
                <SkeletonCard height={190} />
                <SkeletonCard height={190} />
              </>
            ) : (
              <>
                <BentoCard
                  title="DeepScan Alert"
                  eyebrow="Foundation Gaps"
                >
                  <Text className="font-ui text-sm leading-6 text-primary/72">
                    {snapshot.deepScanAlert}
                  </Text>
                  <Text className="mt-4 font-heading text-lg text-secondary">
                    {snapshot.recoveryFocus}
                  </Text>
                </BentoCard>

                <BentoCard
                  title="Target University Tracker"
                  eyebrow="Admissions Delta"
                >
                  <Text className="font-ui text-sm leading-6 text-primary/72">
                    {snapshot.targetUniversity}
                  </Text>
                  <Text className="mt-4 font-heading text-3xl text-accent">
                    Delta {snapshot.targetDelta} pts
                  </Text>
                </BentoCard>

                <BentoCard
                  title="Focus Flow"
                  eyebrow="Deep Study Session"
                >
                  <Text className="font-heading text-4xl text-primary">
                    {snapshot.focusMinutes} min
                  </Text>
                  <Text className="mt-3 font-ui text-sm leading-6 text-primary/72">
                    One-tap sessions with haptic-confirmed card interactions and room for a future live timer.
                  </Text>
                </BentoCard>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
