import { BlurView } from "expo-blur";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { navItems } from "@/navigation/nav-items";

import { NavLink } from "./nav-link";

export function SideNav() {
  return (
    <SafeAreaView
      edges={["top", "bottom", "left"]}
      className="w-[280px] border-r border-primary/8"
    >
      <BlurView
        intensity={55}
        tint="light"
        className="flex-1 px-5 py-6"
        style={
          {
            backgroundColor: "rgba(245,245,240,0.72)",
            backdropFilter: "blur(22px)",
          } as never
        }
      >
        <View className="rounded-[28px] border border-primary/8 bg-primary px-5 py-6">
          <Text className="font-heading text-3xl text-surface">KORU</Text>
          <Text className="mt-2 font-ui text-sm leading-6 text-surface/72">
            Precision guidance for ambitious learners.
          </Text>
        </View>

        <View className="mt-8 gap-3">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </View>
      </BlurView>
    </SafeAreaView>
  );
}
