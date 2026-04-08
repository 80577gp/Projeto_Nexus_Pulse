import "../global.css";

import { Inter_400Regular, Inter_500Medium, useFonts as useInterFonts } from "@expo-google-fonts/inter";
import { Lora_600SemiBold, Lora_700Bold, useFonts as useLoraFonts } from "@expo-google-fonts/lora";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppBootstrap } from "@/components/boot/app-bootstrap";
import { ResponsiveProvider } from "@/providers/responsive-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { useAppStore } from "@/stores/app-store";

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
  });
  const [loraLoaded] = useLoraFonts({
    Lora_600SemiBold,
    Lora_700Bold,
  });
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  const isReady = interLoaded && loraLoaded && hasHydrated;

  return (
    <AppBootstrap isReady={isReady}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ResponsiveProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "transparent" },
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </ResponsiveProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AppBootstrap>
  );
}
