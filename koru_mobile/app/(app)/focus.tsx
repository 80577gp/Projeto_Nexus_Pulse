import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

export default function FocusScreen() {
  return (
    <View className="flex-1 bg-background px-6 py-8">
      <Animated.View
        sharedTransitionTag="dashboard-spiral"
        className="rounded-[30px] border border-primary/8 bg-white/36 px-6 py-6"
      >
        <Text className="font-heading text-3xl text-primary">Focus</Text>
        <Text className="mt-3 font-ui text-base leading-7 text-primary/68">
          Mastery transitions directly into the focus module so the movement feels continuous and intentional.
        </Text>
      </Animated.View>

      <Animated.View
        sharedTransitionTag="dashboard-focus-pill"
        className="mt-4 rounded-[24px] border border-primary/8 bg-white/28 px-5 py-4"
      >
        <Text className="font-ui text-[11px] uppercase tracking-[2px] text-secondary">
          Session Pulse
        </Text>
        <Text className="mt-2 font-heading text-2xl text-primary">
          42 minutes of calm, uninterrupted study
        </Text>
      </Animated.View>
    </View>
  );
}
