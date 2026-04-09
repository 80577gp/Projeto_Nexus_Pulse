import { PropsWithChildren } from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import Animated from "react-native-reanimated";

type BentoCardProps = PropsWithChildren<{
  title: string;
  eyebrow: string;
  className?: string;
  onPress?: () => void;
  sharedTransitionTag?: string;
}>;

export function BentoCard({
  title,
  eyebrow,
  className = "",
  onPress,
  sharedTransitionTag,
  children,
}: BentoCardProps) {
  return (
    <Pressable
      onPress={async () => {
        await Haptics.selectionAsync().catch(() => null);
        onPress?.();
      }}
      className={`overflow-hidden rounded-[30px] ${className}`}
    >
      <Animated.View sharedTransitionTag={sharedTransitionTag} className="rounded-[30px]">
        <BlurView
          intensity={30}
          tint="light"
          className="overflow-hidden rounded-[30px] border border-primary/10"
          style={{
            backgroundColor: "rgba(249,247,242,0.78)",
            shadowColor: "#1A1A1A",
            shadowOpacity: 0.1,
            shadowRadius: 26,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          <View className="absolute inset-0 rounded-[30px] border border-white/40" />
          <View className="absolute left-4 right-4 top-0 h-8 rounded-b-[24px] bg-white/18" />
          <View className="absolute bottom-0 left-5 right-5 h-10 rounded-t-[24px] bg-primary/5" />
          <View className="px-5 py-5">
            <Text className="font-ui text-[11px] uppercase tracking-[3px] text-secondary">
              {eyebrow}
            </Text>
            <Text className="mt-3 font-heading text-2xl text-primary">{title}</Text>
            <View className="mt-4">{children}</View>
          </View>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}
