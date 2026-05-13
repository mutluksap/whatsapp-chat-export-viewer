"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Dropzone, { type ImportMode } from "@/components/Dropzone";
import { useChat } from "@/components/ChatProvider";
import { useI18n } from "@/components/I18nProvider";

type Step = { n: string; icon: string; title: string; body: string };

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <li className="group relative bg-wa-sidebar rounded-2xl p-6 pt-7 border border-wa-divider/60 shadow-sm hover:shadow-xl hover:shadow-wa-green-dark/10 hover:-translate-y-1 hover:border-wa-green/50 transition-all duration-300">
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-wa-green-dark to-emerald-500 shadow-lg shadow-wa-green-dark/25 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <i className={`fa-solid ${step.icon} text-xl`} aria-hidden />
        </div>
        <div className="absolute -top-2 -right-2 min-w-[26px] h-[26px] px-1.5 rounded-full bg-wa-sidebar text-wa-green-dark dark:text-wa-green font-bold text-[11px] flex items-center justify-center shadow-md ring-2 ring-wa-green-dark/15 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
      <h3 className="font-semibold text-wa-text mb-1.5 tracking-tight">
        {step.title}
      </h3>
      <p className="text-sm text-wa-text-muted leading-relaxed">{step.body}</p>
    </li>
  );
}

function ArrowDivider() {
  return (
    <div className="flex items-center justify-center px-2" aria-hidden>
      <div className="flex items-center gap-1.5 text-wa-green-dark/60 dark:text-wa-green/70">
        <span className="w-3 h-px bg-gradient-to-r from-wa-green-dark/0 to-wa-green-dark/40 dark:from-wa-green/0 dark:to-wa-green/40" />
        <span className="w-9 h-9 rounded-full bg-wa-sidebar border border-wa-divider/70 shadow-sm flex items-center justify-center">
          <i className="fa-solid fa-arrow-right text-xs" />
        </span>
        <span className="w-3 h-px bg-gradient-to-l from-wa-green-dark/0 to-wa-green-dark/40 dark:from-wa-green/0 dark:to-wa-green/40" />
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const { load, isLoading, progress, error } = useChat();

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

  const steps = [
    {
      n: "01",
      icon: "fa-mobile-screen-button",
      title: t("homeHow1Title"),
      body: t("homeHow1Body"),
    },
    {
      n: "02",
      icon: "fa-cloud-arrow-up",
      title: t("homeHow2Title"),
      body: t("homeHow2Body"),
    },
    {
      n: "03",
      icon: "fa-magnifying-glass",
      title: t("homeHow3Title"),
      body: t("homeHow3Body"),
    },
  ];

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
    { q: t("faq5Q"), a: t("faq5A") },
    { q: t("faq6Q"), a: t("faq6A") },
  ];

  return (
    <>
      {/* Hero — split layout */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0a0e12]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[80rem] h-[40rem] rounded-full opacity-40 blur-3xl bg-gradient-to-br from-wa-green/40 via-emerald-300/30 to-teal-300/20 dark:from-wa-green/20 dark:via-emerald-700/20 dark:to-teal-900/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
          {/* Left column */}
          <div className="text-left">
            <div
              className="inline-flex items-center gap-2 bg-wa-sidebar/80 backdrop-blur border border-wa-divider/60 text-xs font-medium text-wa-text-muted px-3 py-1.5 rounded-full shadow-sm animate-fade-in-up"
              style={{ animationDelay: "60ms" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-wa-green-dark dark:bg-wa-green animate-pulse" />
              <span>{t("heroBadge")}</span>
            </div>

            <h1
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-wa-text leading-[1.05] tracking-tight animate-fade-in-up"
              style={{ animationDelay: "120ms" }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-wa-green-dark via-emerald-500 to-teal-500 dark:from-wa-green dark:via-emerald-400 dark:to-teal-400">
                {t("heroAccentWord")}
              </span>{" "}
              <span className="block sm:inline">{t("homeHeroTitle")}</span>
            </h1>

            <p
              className="mt-5 text-base sm:text-lg text-wa-text-muted max-w-xl leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              {t("homeHeroSubtitle")}
            </p>

            <div
              className="mt-8 flex items-center gap-2 sm:gap-3 flex-wrap animate-fade-in-up"
              style={{ animationDelay: "280ms" }}
            >
              <Link
                href="/chats"
                className="group inline-flex items-center gap-2 bg-wa-green-dark hover:bg-wa-green text-white font-medium px-6 py-3 rounded-full shadow-lg shadow-wa-green-dark/20 hover:shadow-wa-green-dark/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <i
                  className="fa-solid fa-cloud-arrow-up text-sm transition-transform group-hover:scale-110"
                  aria-hidden
                />
                {t("homeHeroCta")}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-wa-divider hover:border-wa-green/50 text-wa-text px-5 py-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <i className="fa-solid fa-circle-info text-xs" aria-hidden />
                {t("navAbout")}
              </Link>
            </div>

            <div
              className="mt-8 flex flex-wrap gap-2 animate-fade-in-up"
              style={{ animationDelay: "360ms" }}
            >
              <span className="inline-flex items-center gap-2 bg-wa-sidebar/80 border border-wa-divider/60 text-xs text-wa-text-muted px-3 py-1.5 rounded-full">
                {t("heroChip1")}
              </span>
              <span className="inline-flex items-center gap-2 bg-wa-sidebar/80 border border-wa-divider/60 text-xs text-wa-text-muted px-3 py-1.5 rounded-full">
                {t("heroChip2")}
              </span>
            </div>
          </div>

          {/* Right column — chat preview mockup */}
          <div
            className="relative animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <div
              aria-hidden
              className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-wa-green/15 via-transparent to-emerald-300/15 blur-2xl"
            />
            <div className="relative bg-wa-sidebar rounded-3xl shadow-2xl ring-1 ring-wa-divider/60 overflow-hidden">
              {/* mock chat header */}
              <div className="bg-wa-panel px-4 py-3 flex items-center gap-3 border-b border-wa-divider/60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wa-green-dark to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                  AB
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-wa-text text-sm truncate">
                    Alice &amp; Bob
                  </div>
                  <div className="text-[11px] text-wa-text-muted">online</div>
                </div>
                <i
                  className="fa-solid fa-video text-wa-text-muted text-sm"
                  aria-hidden
                />
                <i
                  className="fa-solid fa-phone text-wa-text-muted text-sm"
                  aria-hidden
                />
              </div>

              {/* mock messages */}
              <div className="wa-chat-bg px-4 py-5 space-y-2 min-h-[280px]">
                <div className="flex justify-start">
                  <div className="bg-wa-bubble shadow-sm rounded-lg px-3 py-2 max-w-[75%]">
                    <div className="text-sm text-wa-text">
                      Hey, did you see the photos?
                    </div>
                    <div className="text-[10px] text-wa-text-muted text-right mt-0.5">
                      14:23
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-wa-bubble-out shadow-sm rounded-lg px-3 py-2 max-w-[75%]">
                    <div className="text-sm text-wa-text">
                      Yes! They look amazing 🌟
                    </div>
                    <div className="text-[10px] text-wa-text-muted text-right mt-0.5 flex items-center justify-end gap-1">
                      14:24
                      <span className="inline-flex items-center text-sky-500">
                        <i className="fa-solid fa-check text-[10px]" aria-hidden />
                        <i className="fa-solid fa-check text-[10px] -ml-[5px]" aria-hidden />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-wa-bubble-out shadow-sm rounded-lg p-1 max-w-[60%]">
                    <div className="bg-gradient-to-br from-emerald-300 to-teal-500 rounded-md h-24 w-40 flex items-center justify-center">
                      <i
                        className="fa-solid fa-image text-white/80 text-2xl"
                        aria-hidden
                      />
                    </div>
                    <div className="text-[10px] text-wa-text-muted text-right mt-1 pr-1 flex items-center justify-end gap-1">
                      14:25
                      <span className="inline-flex items-center text-sky-500">
                        <i className="fa-solid fa-check text-[10px]" aria-hidden />
                        <i className="fa-solid fa-check text-[10px] -ml-[5px]" aria-hidden />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-wa-bubble shadow-sm rounded-lg px-3 py-2 max-w-[75%]">
                    <div className="text-sm text-wa-text">
                      Send me the others too!
                    </div>
                    <div className="text-[10px] text-wa-text-muted text-right mt-0.5">
                      14:25
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded import */}
      <section className="relative bg-wa-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-wa-text tracking-tight">
              {t("homeImportSectionHeading")}
            </h2>
            <p className="text-wa-text-muted mt-2">
              {t("homeImportSectionLead")}
            </p>
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-x-4 -inset-y-2 sm:-inset-x-10 sm:-inset-y-4 rounded-3xl bg-gradient-to-br from-wa-green/10 via-transparent to-emerald-300/10 blur-xl pointer-events-none"
            />
            <div className="relative">
              <Dropzone
                variant="card"
                showHeading={false}
                onFileSelected={handleFile}
                isLoading={isLoading}
                progress={progress}
                error={error}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-wa-panel">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-semibold text-wa-text text-center tracking-tight mb-10 sm:mb-12">
            {t("homeFeaturesHeading")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-wa-sidebar rounded-2xl p-6 border border-wa-divider/60 shadow-sm hover:shadow-xl hover:shadow-wa-green-dark/10 hover:-translate-y-1 hover:border-wa-green/50 transition-all duration-300 overflow-hidden"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-wa-green/0 via-wa-green/0 to-wa-green/0 group-hover:from-wa-green/5 group-hover:to-emerald-400/5 transition duration-500"
                />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-wa-green-dark/15 to-emerald-400/10 text-wa-green-dark dark:from-white/10 dark:to-emerald-300/10 dark:text-wa-green flex items-center justify-center mb-4 ring-1 ring-inset ring-wa-green-dark/10 dark:ring-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <i className={`fa-solid ${f.icon} text-lg`} aria-hidden />
                  </div>
                  <h3 className="font-semibold text-wa-text mb-1.5 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm text-wa-text-muted leading-relaxed">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-wa-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-wa-text tracking-tight">
              {t("howItWorksHeading")}
            </h2>
            <p className="text-wa-text-muted mt-2">{t("howItWorksLead")}</p>
          </div>

          {/* Mobile: stacked with chevron-down between */}
          <ol className="sm:hidden grid grid-cols-1 gap-4">
            {steps.map((s, i) => (
              <div key={s.n}>
                <StepCard step={s} index={i} />
                {i < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <i
                      className="fa-solid fa-chevron-down text-wa-text-muted/50"
                      aria-hidden
                    />
                  </div>
                )}
              </div>
            ))}
          </ol>

          {/* Desktop: 3 columns with arrow dividers equidistant between cards */}
          <ol className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-x-3">
            <StepCard step={steps[0]} index={0} />
            <ArrowDivider />
            <StepCard step={steps[1]} index={1} />
            <ArrowDivider />
            <StepCard step={steps[2]} index={2} />
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-wa-panel">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-wa-text tracking-tight">
              {t("faqHeading")}
            </h2>
            <p className="text-wa-text-muted mt-2">{t("faqLead")}</p>
          </div>
          <div className="space-y-2.5">
            {faqs.map((item, i) => (
              <details
                key={i}
                name="faq"
                className="group bg-wa-sidebar rounded-xl border border-wa-divider/60 overflow-hidden transition-all duration-300 hover:border-wa-green-dark/30 hover:shadow-md hover:shadow-wa-green-dark/5 open:border-wa-green-dark/40 open:shadow-md open:shadow-wa-green-dark/5"
              >
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4 text-wa-text font-medium hover:bg-black/[0.02] dark:hover:bg-white/[0.03] select-none">
                  <span>{item.q}</span>
                  <span className="w-6 h-6 shrink-0 rounded-full bg-wa-panel border border-wa-divider/70 flex items-center justify-center text-wa-text-muted group-open:bg-wa-green-dark group-open:text-white group-open:border-wa-green-dark transition-all duration-300">
                    <i
                      className="fa-solid fa-chevron-down text-[10px] transition-transform duration-300 group-open:rotate-180"
                      aria-hidden
                    />
                  </span>
                </summary>
                <div className="px-5 pb-4 -mt-1 text-sm text-wa-text-muted leading-relaxed animate-fade-in">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-wa-green-dark via-emerald-600 to-teal-600">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center text-white">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            {t("ctaBandTitle")}
          </h2>
          <p className="mt-3 text-white/85 max-w-2xl mx-auto">
            {t("ctaBandLead")}
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Link
              href="/chats"
              className="inline-flex items-center gap-2 bg-white text-wa-green-dark hover:bg-emerald-50 font-semibold px-6 py-3 rounded-full shadow-lg shadow-black/15 hover:-translate-y-0.5 transition duration-200"
            >
              <i className="fa-solid fa-cloud-arrow-up" aria-hidden />
              {t("ctaBandButton")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
