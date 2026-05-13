"use client";

import { useI18n } from "@/components/I18nProvider";

export default function PrivacyPage() {
  const { t } = useI18n();
  const sections = [
    { title: t("privacySection1Title"), body: t("privacySection1Body") },
    { title: t("privacySection2Title"), body: t("privacySection2Body") },
    { title: t("privacySection3Title"), body: t("privacySection3Body") },
  ];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 w-full">
      <div className="inline-flex items-center gap-2 bg-wa-sidebar border border-wa-divider/60 text-xs font-medium text-wa-text-muted px-3 py-1.5 rounded-full mb-5">
        <i className="fa-solid fa-shield-halved text-[10px] text-wa-green-dark dark:text-wa-green" aria-hidden />
        <span>{t("navPrivacy")}</span>
      </div>
      <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-wa-text mb-4 leading-[1.1]">
        {t("privacyTitle")}
      </h1>
      <p className="text-wa-text-muted text-base sm:text-lg max-w-2xl leading-relaxed mb-12">
        {t("privacyLead")}
      </p>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <section
            key={s.title}
            className="bg-wa-sidebar rounded-2xl border border-wa-divider/60 p-6 sm:p-7"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-wa-green-dark/15 to-emerald-400/10 text-wa-green-dark dark:from-white/10 dark:to-emerald-300/10 dark:text-wa-green flex items-center justify-center text-xs font-semibold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-lg sm:text-xl font-semibold text-wa-text tracking-tight">
                {s.title}
              </h2>
            </div>
            <p className="text-wa-text-muted leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
