import { useEffect } from "react";
import { Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SPIRAL_PATH =
  "M165 165 C165 120 125 90 92 107 C63 122 56 162 79 188 C104 216 152 219 184 192 C217 164 225 112 193 77 C159 39 97 31 50 62 C6 91 -8 153 22 205 C56 264 136 285 203 256 C271 228 305 148 271 79";
const TOTAL_LENGTH = 760;

type SpiralMasteryProps = {
  mastery: number;
  masteredTopics: number;
  totalTopics: number;
};

export function SpiralMastery({
  mastery,
  masteredTopics,
  totalTopics,
}: SpiralMasteryProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(mastery, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [mastery, progress]);

  const animatedProps = useAnimatedProps(() => {
    const stroke = interpolateColor(
      progress.value,
      [0, 1],
      ["#CFCFC8", "#8A9A5B"]
    );

    return {
      strokeDashoffset: TOTAL_LENGTH * (1 - progress.value),
      stroke,
    };
  });

  const glowProps = useAnimatedProps(() => ({
    strokeOpacity: 0.14 + progress.value * 0.34,
    strokeDashoffset: TOTAL_LENGTH * (1 - progress.value),
  }));

  return (
    <View className="rounded-[30px] bg-primary px-5 py-5">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="font-ui text-[11px] uppercase tracking-[3px] text-surface/60">
            Spiral Mastery
          </Text>
          <Text className="mt-2 font-heading text-3xl text-surface">
            {Math.round(mastery * 100)}%
          </Text>
        </View>
        <View className="rounded-full bg-surface/8 px-3 py-2">
          <Text className="font-ui text-sm text-surface/78">
            {masteredTopics}/{totalTopics} topics
          </Text>
        </View>
      </View>

      <View className="mt-6 items-center justify-center">
        <Svg width={320} height={320} viewBox="0 0 320 320">
          <Defs>
            <LinearGradient id="koruSpiralGlow" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#D8E0C4" />
              <Stop offset="100%" stopColor="#8A9A5B" />
            </LinearGradient>
          </Defs>

          <Path
            d={SPIRAL_PATH}
            stroke="rgba(245,245,240,0.14)"
            strokeWidth={20}
            fill="none"
            strokeLinecap="round"
          />

          <AnimatedPath
            d={SPIRAL_PATH}
            animatedProps={glowProps}
            stroke="url(#koruSpiralGlow)"
            strokeWidth={28}
            fill="none"
            strokeDasharray={`${TOTAL_LENGTH} ${TOTAL_LENGTH}`}
            strokeLinecap="round"
            blurRadius={18}
          />

          <AnimatedPath
            d={SPIRAL_PATH}
            animatedProps={animatedProps}
            strokeWidth={18}
            fill="none"
            strokeDasharray={`${TOTAL_LENGTH} ${TOTAL_LENGTH}`}
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <Text className="mt-2 font-ui text-sm leading-6 text-surface/72">
        As mastery grows, the koru unfurls further and deepens into sage to
        signal conceptual confidence.
      </Text>
    </View>
  );
}
