// src/stores/useReaderStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReaderSettings } from "@/types";

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 19,
  fontFamily: "serif",
  lineHeight: 1.8,
  paragraphSpacing: 1.25,
  textAlign: "left",
  contentWidth: "medium",
  theme: "day",
};

interface ReaderStoreState {
  settings: ReaderSettings;
  updateSettings: (partial: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
}

export const useReaderStore = create<ReaderStoreState>()(
  persist(
    (set) => ({
      settings: DEFAULT_READER_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      resetSettings: () => set({ settings: DEFAULT_READER_SETTINGS }),
    }),
    {
      name: "sunlit-reader-settings",
    }
  )
);