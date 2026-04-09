type RewardedAdContext = {
  placement: string;
  studentId?: string;
  missionId?: string;
  fatigueScore?: number;
  rewardLabel?: string;
};

type RewardedAdResult = {
  shown: boolean;
  rewardGranted: boolean;
  provider: "revenuecat-admob";
  trackedAt: string;
  fatigueRisk: "low" | "medium" | "high";
};

export async function loadAndTrackRewardedAd(
  context: RewardedAdContext
): Promise<RewardedAdResult> {
  const fatigueScore = context.fatigueScore ?? 0.22;
  const fatigueRisk =
    fatigueScore >= 0.7 ? "high" : fatigueScore >= 0.4 ? "medium" : "low";

  const trackingPayload = {
    ...context,
    fatigueRisk,
    triggeredAt: new Date().toISOString(),
  };

  if (__DEV__) {
    console.log("loadAndTrackRewardedAd", trackingPayload);
  }

  return {
    shown: fatigueRisk !== "high",
    rewardGranted: fatigueRisk === "low",
    provider: "revenuecat-admob",
    trackedAt: trackingPayload.triggeredAt,
    fatigueRisk,
  };
}
