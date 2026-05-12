"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TRANSLATIONS, type Dict, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "wa-preview-locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dict: Dict;
  t: <K extends keyof Dict>(
    key: K,
    vars?: Record<string, string | number>,
  ) => Dict[K];
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "tr" || stored === "en") {
        setLocaleState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.title = TRANSLATIONS[locale].appTitle;
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<Ctx>(() => {
    const dict = TRANSLATIONS[locale];
    const t = <K extends keyof Dict>(
      key: K,
      vars?: Record<string, string | number>,
    ): Dict[K] => {
      const val = dict[key];
      if (typeof val === "string" && vars) {
        let out: string = val;
        for (const k of Object.keys(vars)) {
          out = out.replace(`{${k}}`, String(vars[k]));
        }
        return out as Dict[K];
      }
      return val;
    };
    return { locale, setLocale, dict, t };
  }, [locale, setLocale]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
