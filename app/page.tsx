"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Dropzone, { type ImportMode } from "@/components/Dropzone";
import { useChat } from "@/components/ChatProvider";
import { useI18n } from "@/components/I18nProvider";

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const { load, isLoading, error } = useChat();

  const handleFile = async (file: File, mode: ImportMode) => {
    const ok = await load(file, mode);
    if (ok) router.push("/chats");
  };

  const features = [
    {
      icon: "fa-shield-halved",
      title: t("homeFeature1Title"),
      body: t("homeFeature1Body"),
    },
    {
      icon: "fa-images",
      title: t("homeFeature2Title"),
      body: t("homeFeature2Body"),
    },
    {
      icon: "fa-comments",
      title: t("homeFeature3Title"),
      body: t("homeFeature3Body"),
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-[#0b141a] dark:via-[#111b21] dark:to-[#0b141a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-semibold text-wa-text leading-tight max-w-3xl mx-auto">
            {t("homeHeroTitle")}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-wa-text-muted max-w-2xl mx-auto">
            {t("homeHeroSubtitle")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/chats"
              className="inline-flex items-center gap-2 bg-wa-green-dark hover:bg-wa-green text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition"
            >
              <i className="fa-solid fa-arrow-right" aria-hidden />
              {t("homeHeroCta")}
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-wa-text-muted hover:text-wa-text px-3 py-2.5 rounded-lg"
            >
              {t("navAbout")}
            </Link>
          </div>
        </div>
      </section>

      {/* Embedded import */}
      <section className="bg-wa-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-wa-text">
              {t("homeImportSectionHeading")}
            </h2>
            <p className="text-wa-text-muted mt-2">
              {t("homeImportSectionLead")}
            </p>
          </div>
          <Dropzone
            variant="card"
            showHeading={false}
            onFileSelected={handleFile}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-wa-panel">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-semibold text-wa-text text-center mb-10">
            {t("homeFeaturesHeading")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-wa-sidebar rounded-xl p-6 shadow-sm"
              >
                <div className="w-11 h-11 rounded-lg bg-wa-green-dark/10 text-wa-green-dark dark:bg-white/10 dark:text-wa-green flex items-center justify-center mb-4">
                  <i className={`fa-solid ${f.icon} text-lg`} aria-hidden />
                </div>
                <h3 className="font-semibold text-wa-text mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-wa-text-muted leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
