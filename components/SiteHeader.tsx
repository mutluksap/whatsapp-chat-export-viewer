"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

export default function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // /chats has its own sidebar (with a brand link back to home) and a full-bleed
  // viewport. Always hide the global site header there so the chat takes the
  // entire screen, regardless of whether a chat is loaded.
  const onChatsRoute =
    pathname === "/chats" || pathname?.startsWith("/chats/");
  if (onChatsRoute) return null;

  const links: { href: string; label: string }[] = [
    { href: "/", label: t("navHome") },
    { href: "/chats", label: t("navChats") },
    { href: "/privacy", label: t("navPrivacy") },
    { href: "/about", label: t("navAbout") },
    { href: "/contact", label: t("navContact") },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-30 bg-wa-panel/70 supports-[backdrop-filter]:bg-wa-panel/60 backdrop-blur-xl border-b border-wa-divider/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 shrink-0"
          onClick={() => setOpen(false)}
        >
          <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-wa-green-dark to-emerald-500 flex items-center justify-center shadow-sm shadow-wa-green-dark/25 transition-transform group-hover:scale-105">
            <i
              className="fa-brands fa-whatsapp text-white text-lg"
              aria-hidden
            />
          </span>
          <span className="hidden sm:inline-flex items-baseline gap-1 text-wa-text font-semibold tracking-tight">
            {t("brand")}
          </span>
        </Link>

        {/* Center nav (in pill container) */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center bg-wa-sidebar/70 border border-wa-divider/50 rounded-full px-1 py-1 shadow-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                isActive(l.href)
                  ? "bg-wa-green-dark text-white shadow-sm shadow-wa-green-dark/30"
                  : "text-wa-text-muted hover:text-wa-text hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Link
            href="/chats"
            className="hidden sm:inline-flex items-center gap-1.5 ml-1 bg-wa-green-dark hover:bg-wa-green text-white text-sm font-medium px-3.5 py-1.5 rounded-full shadow-sm shadow-wa-green-dark/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            {t("homeHeroCta")}
            <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-1.5 rounded-full text-wa-text-muted hover:text-wa-text hover:bg-black/5 dark:hover:bg-white/10 w-8 h-8 flex items-center justify-center"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
          >
            <i
              className={`fa-solid ${open ? "fa-xmark" : "fa-bars"} text-base`}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-wa-divider/40 bg-wa-panel/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-3 py-2 flex flex-col gap-0.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  isActive(l.href)
                    ? "bg-wa-green-dark text-white font-medium"
                    : "text-wa-text hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/chats"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-1.5 bg-wa-green-dark hover:bg-wa-green text-white text-sm font-medium px-3 py-2 rounded-lg transition"
            >
              <i className="fa-solid fa-cloud-arrow-up text-xs" aria-hidden />
              {t("homeHeroCta")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
