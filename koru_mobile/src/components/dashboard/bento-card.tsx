import { PropsWithChildren } from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

type BentoCardProps = PropsWithChildren<{
  title: string;
  eyebrow: string;
  className?: string;
  onPress?: () => void;
}>;

export function BentoCard({
  title,
  eyebrow,
  className = "",
  onPress,
  children,
}: BentoCardProps) {
  return (
    <Pressable
      onPress={async () => {
        await Haptics.selectionAsync().catch(() => null);
        onPress?.();
      }}
      className={`rounded-[30px] border border-primary/8 bg-surface px-5 py-5 shadow-luxe ${className}`}
    >
      <Text className="font-ui text-[11px] uppercase tracking-[3px] text-secondary">
        {eyebrow}
      </Text>
      <Text className="mt-3 font-heading text-2xl text-primary">{title}</Text>
      <View className="mt-4">{children}</View>
    </Pressable>
  );
}
