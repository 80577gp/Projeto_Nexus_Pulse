import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type SkeletonCardProps = {
  height?: number;
};

export function SkeletonCard({ height = 180 }: SkeletonCardProps) {
  const shimmer = useSharedValue(-220);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(220, {
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value }],
  }));

  return (
    <View
      className="overflow-hidden rounded-[30px] border border-primary/8 bg-primary/6"
      style={{ height }}
    >
      <Animated.View
        className="h-full w-[40%] bg-white/45"
        style={shimmerStyle}
      />
    </View>
  );
}
