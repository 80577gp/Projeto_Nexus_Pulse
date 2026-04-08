import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type NavItem = {
  href: "/(app)/dashboard" | "/(app)/deepscan" | "/(app)/tracker" | "/(app)/focus";
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};

export const navItems: NavItem[] = [
  {
    href: "/(app)/dashboard",
    label: "Dashboard",
    icon: "grid-outline",
  },
  {
    href: "/(app)/deepscan",
    label: "DeepScan",
    icon: "sparkles-outline",
  },
  {
    href: "/(app)/tracker",
    label: "Tracker",
    icon: "school-outline",
  },
  {
    href: "/(app)/focus",
    label: "Focus",
    icon: "timer-outline",
  },
];
