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
            <i
              className="fa-brands fa-whatsapp text-white text-3xl"
              aria-hidden
            />
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

          <i
            className="fa-solid fa-cloud-arrow-up text-4xl mx-auto mb-3 block text-wa-text-muted"
            aria-hidden
          />

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
