import { Slot } from "expo-router";

import { AdaptiveLayout } from "@/components/navigation/adaptive-layout";

export default function AppLayout() {
  return (
    <AdaptiveLayout>
      <Slot />
    </AdaptiveLayout>
  );
}
