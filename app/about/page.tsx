"use client";

import { useI18n } from "@/components/I18nProvider";

const techStack: { name: string; icon: string }[] = [
  { name: "Next.js", icon: "fa-brands fa-react" },
  { name: "React", icon: "fa-brands fa-react" },
  { name: "TypeScript", icon: "fa-solid fa-code" },
  { name: "Tailwind CSS", icon: "fa-solid fa-paint-brush" },
  { name: "FontAwesome", icon: "fa-solid fa-icons" },
];

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
      <h1 className="text-3xl sm:text-4xl font-semibold text-wa-text mb-4">
        {t("aboutTitle")}
      </h1>
      <p className="text-wa-text-muted text-base sm:text-lg mb-8">
        {t("aboutLead")}
      </p>
      <div className="space-y-4 text-wa-text leading-relaxed">
        <p>{t("aboutBody1")}</p>
        <p>{t("aboutBody2")}</p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-wa-text mb-4">
          {t("aboutTechHeading")}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <li
              key={tech.name}
              className="inline-flex items-center gap-2 bg-wa-panel text-wa-text px-3 py-1.5 rounded-full text-sm border border-wa-divider"
            >
              <i className={`${tech.icon} text-wa-green-dark`} aria-hidden />
              {tech.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
