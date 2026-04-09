import { useState } from "react";
import { Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";

import { BentoCard } from "@/components/dashboard/bento-card";
import { SpiralMastery } from "@/components/dashboard/spiral-mastery";
import { SkeletonCard } from "@/components/feedback/skeleton-card";
import { useDashboardSnapshot } from "@/hooks/use-dashboard-snapshot";
import { useResponsive } from "@/providers/responsive-provider";
import { loadAndTrackRewardedAd } from "@/services/ads/revenuecat-ad-tracker";

export default function DashboardScreen() {
  const { loading, snapshot } = useDashboardSnapshot();
  const { isDesktop } = useResponsive();
  const router = useRouter();
  const [rewardState, setRewardState] = useState("Reward ready");

  const deepScanAlerts = snapshot
    ? [
        {
          id: "root-gap",
          title: "Root gap",
          description: snapshot.deepScanAlert,
        },
        {
          id: "recovery-focus",
          title: "Recovery focus",
          description: snapshot.recoveryFocus,
        },
        {
          id: "timed-release",
          title: "Timed release",
          description: "Hold advanced drills until symbolic fluency stabilizes.",
        },
      ]
    : [];

  return (
    <View className="flex-1 bg-background">
      <View className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 md:py-8">
        <Text className="font-heading text-4xl text-primary">KORU Dashboard</Text>
        <Text className="mt-3 max-w-3xl font-ui text-base leading-7 text-primary/70">
          A base que te expande. Mastery, remediation, admissions trajectory, and calm deep work in one surface.
        </Text>

        <View className={`mt-8 gap-4 ${isDesktop ? "flex-row" : "flex-col"}`}>
          <View className={`${isDesktop ? "flex-[1.42]" : ""} gap-4`}>
            {loading || !snapshot ? (
              <SkeletonCard height={isDesktop ? 540 : 420} />
            ) : (
              <BentoCard
                title="SpiralMastery"
                eyebrow="Slot A"
                sharedTransitionTag="dashboard-spiral"
                onPress={async () => {
                  await loadAndTrackRewardedAd({
                    placement: "dashboard-spiral-focus",
                    studentId: "local-student",
                    fatigueScore: 0.14,
                    rewardLabel: "Focus continuity",
                  });
                  router.push("/(app)/focus");
                }}
              >
                <SpiralMastery
                  mastery={snapshot.mastery}
                  masteredTopics={snapshot.masteredTopics}
                  totalTopics={snapshot.totalTopics}
                />
              </BentoCard>
            )}
          </View>

          <View className={`${isDesktop ? "flex-[0.92]" : ""} gap-4`}>
            {loading || !snapshot ? (
              <>
                <SkeletonCard height={300} />
                <SkeletonCard height={210} />
              </>
            ) : (
              <>
                <BentoCard
                  title="DeepScan Alerts"
                  eyebrow="Slot B"
                  sharedTransitionTag="dashboard-deepscan"
                  className={isDesktop ? "min-h-[300px]" : ""}
                  onPress={() => router.push("/(app)/deepscan")}
                >
                  <View className="h-[196px]">
                    <FlashList
                      data={deepScanAlerts}
                      keyExtractor={(item) => item.id}
                      estimatedItemSize={68}
                      showsVerticalScrollIndicator={false}
                      renderItem={({ item }) => (
                        <View className="mb-3 rounded-[20px] border border-primary/8 bg-white/24 px-4 py-3">
                          <Text className="font-ui text-[11px] uppercase tracking-[2px] text-secondary">
                            {item.title}
                          </Text>
                          <Text className="mt-2 font-ui text-sm leading-6 text-primary/74">
                            {item.description}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                </BentoCard>

                <BentoCard
                  title="Target University Tracker"
                  eyebrow="Slot C"
                  sharedTransitionTag="dashboard-tracker"
                  onPress={async () => {
                    const result = await loadAndTrackRewardedAd({
                      placement: "dashboard-target-tracker",
                      studentId: "local-student",
                      fatigueScore: 0.18,
                      rewardLabel: "Admissions tracker",
                    });
                    setRewardState(
                      result.rewardGranted
                        ? "Tracker unlocked with calm study flow."
                        : "Tracker preview kept light to avoid fatigue."
                    );
                    router.push("/(app)/tracker");
                  }}
                >
                  <Text className="font-ui text-sm leading-6 text-primary/72">
                    {snapshot.targetUniversity}
                  </Text>
                  <Text className="mt-4 font-heading text-3xl text-accent">
                    Delta {snapshot.targetDelta} pts
                  </Text>
                  <Text className="mt-4 font-ui text-xs uppercase tracking-[2px] text-accent">
                    {rewardState}
                  </Text>
                </BentoCard>

                <Animated.View
                  sharedTransitionTag="dashboard-focus-pill"
                  className="rounded-[24px] border border-primary/8 bg-white/26 px-4 py-4"
                >
                  <Text className="font-ui text-[11px] uppercase tracking-[2px] text-secondary">
                    Focus Flow
                  </Text>
                  <Text className="mt-2 font-heading text-2xl text-primary">
                    {snapshot.focusMinutes} min available
                  </Text>
                  <Text className="mt-2 font-ui text-sm leading-6 text-primary/72">
                    Tap the SpiralMastery card to continue with a shared motion into the focus module.
                  </Text>
                </Animated.View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
