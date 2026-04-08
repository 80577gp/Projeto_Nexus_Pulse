import { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useResponsive } from "@/providers/responsive-provider";

import { BottomTabBar } from "./bottom-tab-bar";
import { SideNav } from "./side-nav";

export function AdaptiveLayout({ children }: PropsWithChildren) {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return (
      <SafeAreaView edges={["top", "right", "bottom", "left"]} className="flex-1 bg-surface">
        <View className="flex-1 flex-row">
          <SideNav />
          <View className="flex-1">{children}</View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "right", "left"]} className="flex-1 bg-surface">
      <View className="flex-1">
        <View className="flex-1">{children}</View>
        <BottomTabBar />
      </View>
    </SafeAreaView>
  );
}
