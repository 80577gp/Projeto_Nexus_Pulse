import { Slot, usePathname } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

import { ResponsiveWrapper } from "@/components/navigation/responsive-wrapper";

export default function AppLayout() {
  const pathname = usePathname();
  const transition = useSharedValue(0);

  useEffect(() => {
    transition.value = 0;
    transition.value = withTiming(1, {
      duration: 340,
      easing: Easing.out(Easing.cubic),
    });
  }, [pathname, transition]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + transition.value * 0.28,
    transform: [
      { perspective: 1200 },
      { rotateY: `${(1 - transition.value) * -6}deg` },
      { translateX: (1 - transition.value) * 14 },
    ],
  }));

  return (
    <ResponsiveWrapper>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Slot />
      </Animated.View>
    </ResponsiveWrapper>
  );
}
