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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
      <h1 className="text-3xl sm:text-4xl font-semibold text-wa-text mb-4">
        {t("privacyTitle")}
      </h1>
      <p className="text-wa-text-muted text-base sm:text-lg mb-10">
        {t("privacyLead")}
      </p>
      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold text-wa-text mb-2">
              {s.title}
            </h2>
            <p className="text-wa-text-muted leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
