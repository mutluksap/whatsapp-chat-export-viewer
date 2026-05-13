"use client";

import { useTheme } from "./ThemeProvider";
import { useI18n } from "./I18nProvider";

export default function ThemeSwitcher() {
  const { theme, toggle } = useTheme();
  const { locale } = useI18n();
  const isDark = theme === "dark";
  const label = isDark
    ? locale === "tr"
      ? "Açık tema"
      : "Light theme"
    : locale === "tr"
      ? "Koyu tema"
      : "Dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="p-1.5 rounded-full text-wa-text-muted hover:text-wa-text hover:bg-black/5 dark:hover:bg-white/10 transition w-8 h-8 flex items-center justify-center"
    >
      <i
        className={`${isDark ? "fa-solid fa-sun" : "fa-solid fa-moon"} text-base`}
        aria-hidden
      />
    </button>
  );
}
