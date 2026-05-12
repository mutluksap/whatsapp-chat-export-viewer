"use client";

import { LOCALES, type Locale } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

type Props = {
  variant?: "light" | "dark";
};

export default function LanguageSwitcher({ variant = "light" }: Props) {
  const { locale, setLocale } = useI18n();
  const base =
    variant === "dark"
      ? "bg-black/10 text-wa-text"
      : "bg-wa-panel text-wa-text";
  return (
    <div className={`inline-flex rounded-md p-0.5 ${base}`} role="group">
      {LOCALES.map((l: Locale) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={`px-2 py-1 text-xs font-semibold rounded uppercase tracking-wide transition ${
            locale === l
              ? "bg-wa-raised text-wa-green-dark shadow-sm"
              : "text-wa-text-muted hover:text-wa-text"
          }`}
          aria-pressed={locale === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
