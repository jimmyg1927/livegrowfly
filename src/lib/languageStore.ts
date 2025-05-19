// src/lib/languageStore.ts
import { create } from 'zustand';

type LanguageState = {
  language: string;
  setLanguage: (lang: string) => void;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'English (UK)', // 🇬🇧 default
  setLanguage: (lang) => set({ language: lang }),
}));
