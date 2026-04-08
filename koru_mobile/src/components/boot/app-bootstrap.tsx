import { PropsWithChildren, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

type AppBootstrapProps = PropsWithChildren<{
  isReady: boolean;
}>;

export function AppBootstrap({ children, isReady }: AppBootstrapProps) {
  useEffect(() => {
    if (!isReady) {
      return;
    }

    SplashScreen.hideAsync().catch(() => null);
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return children;
}
