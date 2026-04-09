import "../global.css";

import { Inter_400Regular, Inter_500Medium, useFonts as useInterFonts } from "@expo-google-fonts/inter";
import { Lora_600SemiBold, Lora_700Bold, useFonts as useLoraFonts } from "@expo-google-fonts/lora";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppBootstrap } from "@/components/boot/app-bootstrap";
import { ResponsiveProvider } from "@/providers/responsive-provider";
import { initializeSecureMMKV } from "@/services/security/secure-mmkv";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeProvider } from "@/providers/theme-provider";
import { useStudyCacheStore } from "@/stores/study-cache-store";
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
  const securityReady = useAppStore((state) => state.securityReady);
  const setSecurityReady = useAppStore((state) => state.setSecurityReady);

  useEffect(() => {
    let cancelled = false;

    initializeSecureMMKV()
      .then(() => {
        useAppStore.persist.rehydrate();
        useAuthStore.persist.rehydrate();
        useStudyCacheStore.persist.rehydrate();
        if (!cancelled) {
          setSecurityReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSecurityReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setSecurityReady]);

  const isReady = interLoaded && loraLoaded && securityReady && hasHydrated;

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
