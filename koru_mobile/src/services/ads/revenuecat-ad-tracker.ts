type RewardedAdContext = {
  placement: string;
  studentId?: string;
  missionId?: string;
};

type RewardedAdResult = {
  shown: boolean;
  rewardGranted: boolean;
  provider: "revenuecat-admob";
};

export async function loadAndTrackRewardedAd(
  context: RewardedAdContext
): Promise<RewardedAdResult> {
  const trackingPayload = {
    ...context,
    triggeredAt: new Date().toISOString(),
  };

  if (__DEV__) {
    console.log("loadAndTrackRewardedAd", trackingPayload);
  }

  return {
    shown: false,
    rewardGranted: false,
    provider: "revenuecat-admob",
  };
}
