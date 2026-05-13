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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 w-full">
      <div className="inline-flex items-center gap-2 bg-wa-sidebar border border-wa-divider/60 text-xs font-medium text-wa-text-muted px-3 py-1.5 rounded-full mb-5">
        <i className="fa-solid fa-circle-info text-[10px] text-wa-green-dark dark:text-wa-green" aria-hidden />
        <span>{t("navAbout")}</span>
      </div>
      <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-wa-text mb-4 leading-[1.1]">
        {t("aboutTitle")}
      </h1>
      <p className="text-wa-text-muted text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
        {t("aboutLead")}
      </p>
      <div className="space-y-4 text-wa-text leading-relaxed">
        <p>{t("aboutBody1")}</p>
        <p>{t("aboutBody2")}</p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-wa-text tracking-tight mb-4">
          {t("aboutTechHeading")}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <li
              key={tech.name}
              className="inline-flex items-center gap-2 bg-wa-sidebar text-wa-text px-3 py-1.5 rounded-full text-sm border border-wa-divider/60 hover:border-wa-green-dark/40 transition"
            >
              <i className={`${tech.icon} text-wa-green-dark dark:text-wa-green`} aria-hidden />
              {tech.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
