import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getCacheStorage } from "@/services/security/secure-mmkv";


export type OfflineTopic = {
  id: number;
  name: string;
  subjectId: number;
};

type StudyCacheStore = {
  offlineTopics: OfflineTopic[];
  masteryBySkill: Record<string, number>;
  lastTopicSyncAt: string | null;
  lastMasterySyncAt: string | null;
  cacheTopics: (topics: OfflineTopic[]) => void;
  updateMastery: (skillKey: string, mastery: number) => void;
};

const cacheStorageAdapter = {
  setItem: (name: string, value: string) => {
    try {
      getCacheStorage().set(name, value);
    } catch {}
  },
  getItem: (name: string) => {
    try {
      return getCacheStorage().getString(name) ?? null;
    } catch {
      return null;
    }
  },
  removeItem: (name: string) => {
    try {
      getCacheStorage().delete(name);
    } catch {}
  },
};

export const useStudyCacheStore = create<StudyCacheStore>()(
  persist(
    (set) => ({
      offlineTopics: [],
      masteryBySkill: {},
      lastTopicSyncAt: null,
      lastMasterySyncAt: null,
      cacheTopics: (topics) =>
        set({
          offlineTopics: topics,
          lastTopicSyncAt: new Date().toISOString(),
        }),
      updateMastery: (skillKey, mastery) =>
        set((state) => ({
          masteryBySkill: {
            ...state.masteryBySkill,
            [skillKey]: mastery,
          },
          lastMasterySyncAt: new Date().toISOString(),
        })),
    }),
    {
      name: "koru-study-cache-store",
      storage: createJSONStorage(() => cacheStorageAdapter),
    }
  )
);
