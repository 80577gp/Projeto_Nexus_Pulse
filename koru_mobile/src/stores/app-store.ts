import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const storage = new MMKV({
  id: "koru-app-storage",
});

type AppStore = {
  hasHydrated: boolean;
  themeMode: "light" | "dark";
  markHydrated: () => void;
  setThemeMode: (themeMode: "light" | "dark") => void;
};

const mmkvStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => storage.getString(name) ?? null,
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      themeMode: "light",
      markHydrated: () => set({ hasHydrated: true }),
      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    {
      name: "koru-root-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
