"use client";

import { useI18n } from "@/components/I18nProvider";

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
      <h1 className="text-3xl sm:text-4xl font-semibold text-wa-text mb-4">
        {t("contactTitle")}
      </h1>
      <p className="text-wa-text-muted text-base sm:text-lg mb-8">
        {t("contactLead")}
      </p>

      <p className="text-wa-text mb-6 leading-relaxed">{t("contactBody")}</p>

      <ul className="space-y-3">
        <li className="flex items-start gap-3 bg-wa-panel rounded-lg p-4 border border-wa-divider">
          <span className="w-10 h-10 rounded-lg bg-wa-green-dark/10 text-wa-green-dark dark:bg-white/10 dark:text-wa-green flex items-center justify-center shrink-0">
            <i className="fa-solid fa-envelope" aria-hidden />
          </span>
          <div>
            <div className="text-xs uppercase tracking-wide text-wa-text-muted">
              {t("contactEmailLabel")}
            </div>
            <a
              href="mailto:hello@example.com"
              className="text-wa-text hover:underline"
            >
              hello@example.com
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3 bg-wa-panel rounded-lg p-4 border border-wa-divider">
          <span className="w-10 h-10 rounded-lg bg-wa-green-dark/10 text-wa-green-dark dark:bg-white/10 dark:text-wa-green flex items-center justify-center shrink-0">
            <i className="fa-brands fa-github" aria-hidden />
          </span>
          <div>
            <div className="text-xs uppercase tracking-wide text-wa-text-muted">
              {t("contactGithubLabel")}
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wa-text hover:underline"
            >
              github.com
            </a>
          </div>
        </li>
      </ul>
    </div>
  );
}
