"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "./I18nProvider";
import { useChat } from "./ChatProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

export default function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { chat } = useChat();
  const [open, setOpen] = useState(false);

  // Hide the site header on /chats when a chat is loaded — the chat view has
  // its own sidebar header (with a Home link) and we want a fully immersive
  // full-bleed viewport for the chat itself.
  const onChatsRoute =
    pathname === "/chats" || pathname?.startsWith("/chats/");
  if (onChatsRoute && chat) return null;

  const links: { href: string; label: string }[] = [
    { href: "/", label: t("navHome") },
    { href: "/chats", label: t("navChats") },
    { href: "/privacy", label: t("navPrivacy") },
    { href: "/about", label: t("navAbout") },
    { href: "/contact", label: t("navContact") },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const isChats = pathname === "/chats" || pathname?.startsWith("/chats/");
  const stickyClass = isChats ? "" : "sticky top-0";

  return (
    <header
      className={`bg-wa-panel/80 supports-[backdrop-filter]:bg-wa-panel/70 backdrop-blur-md border-b border-wa-divider/60 z-30 ${stickyClass}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-wa-text font-semibold shrink-0"
          onClick={() => setOpen(false)}
        >
          <span className="w-8 h-8 rounded-full bg-wa-green-dark flex items-center justify-center">
            <i
              className="fa-brands fa-whatsapp text-white text-base"
              aria-hidden
            />
          </span>
          <span className="hidden sm:inline">{t("brand")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded text-sm transition ${
                isActive(l.href)
                  ? "bg-wa-green-dark/10 text-wa-green-dark dark:text-wa-green dark:bg-white/10 font-medium"
                  : "text-wa-text-muted hover:text-wa-text hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeSwitcher />
          <LanguageSwitcher />
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
        <nav className="md:hidden border-t border-wa-divider bg-wa-panel">
          <div className="max-w-6xl mx-auto px-3 py-2 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded text-sm ${
                  isActive(l.href)
                    ? "bg-wa-green-dark/10 text-wa-green-dark dark:text-wa-green dark:bg-white/10 font-medium"
                    : "text-wa-text hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
