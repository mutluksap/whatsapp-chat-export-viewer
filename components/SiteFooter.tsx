"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { useChat } from "./ChatProvider";

export default function SiteFooter() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { chat } = useChat();

  const onChatsRoute =
    pathname === "/chats" || pathname?.startsWith("/chats/");
  if (onChatsRoute && chat) return null;

  return (
    <footer className="relative bg-wa-panel border-t border-wa-divider/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-wa-green-dark to-emerald-600 flex items-center justify-center shadow-sm">
            <i
              className="fa-brands fa-whatsapp text-white text-lg"
              aria-hidden
            />
          </span>
          <div>
            <div className="font-semibold text-wa-text tracking-tight">
              {t("brand")}
            </div>
            <div className="text-xs text-wa-text-muted max-w-sm leading-relaxed">
              {t("footerTagline")}
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:ml-auto text-sm">
          <Link href="/" className="text-wa-text-muted hover:text-wa-text transition">
            {t("navHome")}
          </Link>
          <Link href="/chats" className="text-wa-text-muted hover:text-wa-text transition">
            {t("navChats")}
          </Link>
          <Link href="/privacy" className="text-wa-text-muted hover:text-wa-text transition">
            {t("navPrivacy")}
          </Link>
          <Link href="/about" className="text-wa-text-muted hover:text-wa-text transition">
            {t("navAbout")}
          </Link>
          <Link href="/contact" className="text-wa-text-muted hover:text-wa-text transition">
            {t("navContact")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-wa-divider/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 text-xs text-wa-text-muted flex items-center justify-between">
          <span>{t("footerCopyright")}</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-wa-text-muted">
            <i className="fa-solid fa-lock text-[10px]" aria-hidden />
            {t("privacyNote")}
          </span>
        </div>
      </div>
    </footer>
  );
}
