import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

import { navItems } from "@/navigation/nav-items";

import { NavLink } from "./nav-link";

export function BottomTabBar() {
  return (
    <SafeAreaView edges={["bottom"]} className="bg-transparent">
      <View className="px-4 pb-4">
        <View
          className="flex-row items-center justify-around rounded-[28px] border border-primary/8 bg-surface/88 px-3 py-3"
          style={{
            shadowColor: "#1A1A1A",
            shadowOpacity: 0.08,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} compact />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
