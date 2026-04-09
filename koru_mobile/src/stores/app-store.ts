import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getAppStorage } from "@/services/security/secure-mmkv";


type AppStore = {
  hasHydrated: boolean;
  securityReady: boolean;
  themeMode: "light" | "dark";
  markHydrated: () => void;
  setSecurityReady: (value: boolean) => void;
  setThemeMode: (themeMode: "light" | "dark") => void;
};

const appStorageAdapter = {
  setItem: (name: string, value: string) => {
    try {
      getAppStorage().set(name, value);
    } catch {
      // Storage becomes available after secure bootstrap.
    }
  },
  getItem: (name: string) => {
    try {
      return getAppStorage().getString(name) ?? null;
    } catch {
      return null;
    }
  },
  removeItem: (name: string) => {
    try {
      getAppStorage().delete(name);
    } catch {
      // Storage becomes available after secure bootstrap.
    }
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      securityReady: false,
      themeMode: "light",
      markHydrated: () => set({ hasHydrated: true }),
      setSecurityReady: (securityReady) => set({ securityReady }),
      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    {
      name: "koru-root-store",
      storage: createJSONStorage(() => appStorageAdapter),
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
