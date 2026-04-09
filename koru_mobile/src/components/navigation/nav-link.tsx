import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { NavItem } from "@/navigation/nav-items";


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NavLinkProps = {
  item: NavItem;
  compact?: boolean;
};

export function NavLink({ item, compact = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const pressProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { scale: 1 - pressProgress.value * 0.03 },
      { rotateY: `${pressProgress.value * 9}deg` },
    ],
  }));

  return (
    <Link href={item.href} asChild>
      <AnimatedPressable
        onPressIn={async () => {
          pressProgress.value = withTiming(1, { duration: 140 });
          await Haptics.selectionAsync().catch(() => null);
        }}
        onPressOut={() => {
          pressProgress.value = withTiming(0, { duration: 220 });
        }}
        className={[
          "rounded-[22px] border px-4 py-3",
          compact ? "min-w-[72px] items-center justify-center px-3 py-2.5" : "flex-row items-center gap-3",
          isActive
            ? "border-secondary/20 bg-secondary/12"
            : "border-primary/8 bg-surface/70",
        ].join(" ")}
        style={
          [
            animatedStyle,
            isActive
              ? {
                  shadowColor: "#8A9A5B",
                  shadowOpacity: 0.18,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 6 },
                }
              : undefined,
          ]
        }
      >
        <Ionicons
          name={item.icon}
          size={compact ? 20 : 19}
          color={isActive ? "#8A9A5B" : "#1A1A1A"}
        />
        <Text
          className={[
            compact ? "mt-1 text-center text-[11px]" : "text-sm",
            isActive ? "font-heading text-secondary" : "font-ui text-primary/72",
          ].join(" ")}
        >
          {item.label}
        </Text>
      </AnimatedPressable>
    </Link>
  );
}
