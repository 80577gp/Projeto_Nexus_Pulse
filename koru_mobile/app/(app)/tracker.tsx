import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

export default function TrackerScreen() {
  return (
    <View className="flex-1 bg-background px-6 py-8">
      <Animated.View
        sharedTransitionTag="dashboard-tracker"
        className="rounded-[30px] border border-primary/8 bg-white/36 px-6 py-6"
      >
        <Text className="font-heading text-3xl text-primary">Tracker</Text>
        <Text className="mt-3 font-ui text-base leading-7 text-primary/68">
          Admissions delta and target pacing inherit the same floating glass card from the main dashboard.
        </Text>
      </Animated.View>
    </View>
  );
}
