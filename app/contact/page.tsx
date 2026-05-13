"use client";

import { useI18n } from "@/components/I18nProvider";

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 w-full">
      <div className="inline-flex items-center gap-2 bg-wa-sidebar border border-wa-divider/60 text-xs font-medium text-wa-text-muted px-3 py-1.5 rounded-full mb-5">
        <i className="fa-solid fa-paper-plane text-[10px] text-wa-green-dark dark:text-wa-green" aria-hidden />
        <span>{t("navContact")}</span>
      </div>
      <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-wa-text mb-4 leading-[1.1]">
        {t("contactTitle")}
      </h1>
      <p className="text-wa-text-muted text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
        {t("contactLead")}
      </p>

      <p className="text-wa-text mb-6 leading-relaxed">{t("contactBody")}</p>

      <ul className="grid sm:grid-cols-2 gap-3">
        <li>
          <a
            href="mailto:hello@example.com"
            className="flex items-start gap-3 bg-wa-sidebar rounded-2xl p-5 border border-wa-divider/60 hover:border-wa-green-dark/40 hover:-translate-y-0.5 hover:shadow-md transition duration-200"
          >
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-wa-green-dark/15 to-emerald-400/10 text-wa-green-dark dark:from-white/10 dark:to-emerald-300/10 dark:text-wa-green flex items-center justify-center shrink-0 ring-1 ring-inset ring-wa-green-dark/10 dark:ring-white/10">
              <i className="fa-solid fa-envelope" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-wa-text-muted font-semibold">
                {t("contactEmailLabel")}
              </div>
              <div className="text-wa-text truncate">hello@example.com</div>
            </div>
          </a>
        </li>
        <li>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 bg-wa-sidebar rounded-2xl p-5 border border-wa-divider/60 hover:border-wa-green-dark/40 hover:-translate-y-0.5 hover:shadow-md transition duration-200"
          >
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-wa-green-dark/15 to-emerald-400/10 text-wa-green-dark dark:from-white/10 dark:to-emerald-300/10 dark:text-wa-green flex items-center justify-center shrink-0 ring-1 ring-inset ring-wa-green-dark/10 dark:ring-white/10">
              <i className="fa-brands fa-github" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-wa-text-muted font-semibold">
                {t("contactGithubLabel")}
              </div>
              <div className="text-wa-text truncate">github.com</div>
            </div>
          </a>
        </li>
      </ul>
    </div>
  );
}
