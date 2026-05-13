"use client";

import Link from "next/link";
import { useI18n } from "./I18nProvider";

export default function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="bg-wa-panel border-t border-wa-divider mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-wa-green-dark flex items-center justify-center">
            <i
              className="fa-brands fa-whatsapp text-white text-lg"
              aria-hidden
            />
          </span>
          <div>
            <div className="font-semibold text-wa-text">{t("brand")}</div>
            <div className="text-xs text-wa-text-muted max-w-sm">
              {t("footerTagline")}
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-4 sm:ml-auto text-sm">
          <Link
            href="/"
            className="text-wa-text-muted hover:text-wa-text"
          >
            {t("navHome")}
          </Link>
          <Link
            href="/chats"
            className="text-wa-text-muted hover:text-wa-text"
          >
            {t("navChats")}
          </Link>
          <Link
            href="/privacy"
            className="text-wa-text-muted hover:text-wa-text"
          >
            {t("navPrivacy")}
          </Link>
          <Link
            href="/about"
            className="text-wa-text-muted hover:text-wa-text"
          >
            {t("navAbout")}
          </Link>
          <Link
            href="/contact"
            className="text-wa-text-muted hover:text-wa-text"
          >
            {t("navContact")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-wa-divider">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 text-xs text-wa-text-muted">
          {t("footerCopyright")}
        </div>
      </div>
    </footer>
  );
}
