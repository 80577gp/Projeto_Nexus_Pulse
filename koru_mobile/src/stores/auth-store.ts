import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getAuthStorage } from "@/services/security/secure-mmkv";


type AuthStore = {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (tokens: { accessToken?: string | null; refreshToken?: string | null }) => void;
  clearTokens: () => void;
};

const authStorageAdapter = {
  setItem: (name: string, value: string) => {
    try {
      getAuthStorage().set(name, value);
    } catch {
      // Storage becomes available after secure bootstrap.
    }
  },
  getItem: (name: string) => {
    try {
      return getAuthStorage().getString(name) ?? null;
    } catch {
      return null;
    }
  },
  removeItem: (name: string) => {
    try {
      getAuthStorage().delete(name);
    } catch {
      // Storage becomes available after secure bootstrap.
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: ({ accessToken, refreshToken }) =>
        set((state) => ({
          accessToken: accessToken ?? state.accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
        })),
      clearTokens: () =>
        set({
          accessToken: null,
          refreshToken: null,
        }),
    }),
    {
      name: "koru-auth-store",
      storage: createJSONStorage(() => authStorageAdapter),
    }
  )
);
