"use client";

import { useRef, useState } from "react";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

export type ImportMode = "text" | "zip";

type DropzoneProps = {
  onFileSelected: (file: File, mode: ImportMode) => void;
  isLoading: boolean;
  error: string | null;
};

export default function Dropzone({
  onFileSelected,
  isLoading,
  error,
}: DropzoneProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<ImportMode>("text");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accept = mode === "text" ? ".txt,text/plain" : ".zip,application/zip";

  const handleFile = (file: File) => {
    onFileSelected(file, mode);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-[#0b141a] dark:via-[#111b21] dark:to-[#0b141a]">
      <div className="w-full max-w-xl bg-wa-sidebar rounded-2xl shadow-xl p-6 sm:p-10 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-wa-green-dark flex items-center justify-center mb-4">
            <svg
              viewBox="0 0 32 32"
              className="w-8 h-8 text-white"
              fill="currentColor"
              aria-hidden
            >
              <path d="M16 .395C7.488.395.605 7.28.605 15.791c0 2.804.737 5.547 2.137 7.96L.5 31.605l8.06-2.118a15.34 15.34 0 0 0 7.44 1.892h.006c8.51 0 15.394-6.884 15.394-15.394C31.4 7.28 24.51.395 16 .395zm0 28.18a12.78 12.78 0 0 1-6.514-1.788l-.467-.278-4.78 1.256 1.276-4.66-.305-.482a12.74 12.74 0 0 1-1.95-6.832c0-7.06 5.74-12.802 12.8-12.802 7.06 0 12.8 5.742 12.8 12.802 0 7.06-5.74 12.784-12.86 12.784zm7.018-9.58c-.384-.192-2.27-1.12-2.622-1.248-.352-.128-.608-.192-.864.192-.256.384-.992 1.248-1.216 1.504-.224.256-.448.288-.832.096-.384-.192-1.62-.598-3.086-1.904-1.14-1.018-1.91-2.272-2.134-2.656-.224-.384-.024-.592.168-.784.172-.172.384-.448.576-.672.192-.224.256-.384.384-.64.128-.256.064-.48-.032-.672-.096-.192-.864-2.08-1.184-2.848-.312-.752-.628-.65-.864-.66-.224-.012-.48-.014-.736-.014-.256 0-.672.096-1.024.48-.352.384-1.344 1.312-1.344 3.2 0 1.888 1.376 3.712 1.568 3.968.192.256 2.704 4.128 6.56 5.788.916.396 1.632.632 2.19.808.92.293 1.756.252 2.418.152.738-.11 2.27-.928 2.592-1.824.32-.896.32-1.664.224-1.824-.096-.16-.352-.256-.736-.448z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-wa-text">
            {t("appTitle")}
          </h1>
          <p className="text-sm sm:text-base text-wa-text-muted mt-2 max-w-md">
            {t("appDescription")} {t("privacyNote")}
          </p>
        </div>

        <div className="flex bg-wa-panel rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition ${
              mode === "text"
                ? "bg-wa-raised text-wa-text shadow-sm"
                : "text-wa-text-muted hover:text-wa-text"
            }`}
          >
            {t("modeText")}
          </button>
          <button
            type="button"
            onClick={() => setMode("zip")}
            className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition ${
              mode === "zip"
                ? "bg-wa-raised text-wa-text shadow-sm"
                : "text-wa-text-muted hover:text-wa-text"
            }`}
          >
            {t("modeZip")}
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition ${
            isDragging
              ? "border-wa-green bg-emerald-50 dark:bg-emerald-900/20"
              : "border-gray-300 dark:border-wa-divider hover:border-wa-green hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10"
          } ${isLoading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />

          <svg
            viewBox="0 0 24 24"
            className="w-12 h-12 mx-auto mb-3 text-wa-text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>

          <p className="text-wa-text font-medium">
            {isLoading
              ? t("processing")
              : mode === "text"
                ? t("dropText")
                : t("dropZip")}
          </p>
          <p className="text-sm text-wa-text-muted mt-1">
            {t("orClickToSelect")}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300">
            {error}
          </div>
        )}

        <details className="mt-6 text-sm text-wa-text-muted">
          <summary className="cursor-pointer font-medium text-wa-text hover:text-wa-green-dark dark:hover:text-wa-green">
            {t("howToExport")}
          </summary>
          <ol className="list-decimal list-inside mt-3 space-y-1.5 pl-1">
            <li>{t("howStep1")}</li>
            <li>{t("howStep2")}</li>
            <li>{t("howStep3")}</li>
            <li>{t("howStep4")}</li>
          </ol>
        </details>
      </div>
    </div>
  );
}
