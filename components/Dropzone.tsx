"use client";

import { useRef, useState } from "react";
import type { LoadProgress } from "@/lib/loadChat";
import { useI18n } from "./I18nProvider";

export type ImportMode = "text" | "zip";

type DropzoneProps = {
  onFileSelected: (file: File, mode: ImportMode) => void;
  isLoading: boolean;
  progress: LoadProgress | null;
  error: string | null;
  variant?: "page" | "card";
  showHeading?: boolean;
};

function CircularProgress({ progress }: { progress: LoadProgress | null }) {
  const determinate = progress !== null && progress.total > 0;
  const pct = determinate
    ? Math.min(1, progress.done / progress.total)
    : 0;
  const r = 22;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative w-11 h-11 mx-auto mb-2">
      {determinate ? (
        <svg viewBox="0 0 50 50" className="w-full h-full">
          <circle
            cx="25"
            cy="25"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-wa-divider opacity-50"
          />
          <circle
            cx="25"
            cy="25"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-wa-green-dark dark:text-wa-green"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            transform="rotate(-90 25 25)"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 50 50" className="w-full h-full animate-spin">
          <circle
            cx="25"
            cy="25"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-wa-divider opacity-50"
          />
          <circle
            cx="25"
            cy="25"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-wa-green-dark dark:text-wa-green"
            strokeDasharray={`${c * 0.25} ${c * 0.75}`}
          />
        </svg>
      )}
      {determinate && (
        <div className="absolute inset-0 flex items-center justify-center text-wa-text text-[10px] font-semibold tabular-nums">
          {Math.round(pct * 100)}%
        </div>
      )}
    </div>
  );
}

export default function Dropzone({
  onFileSelected,
  isLoading,
  progress,
  error,
  variant = "page",
  showHeading = true,
}: DropzoneProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setLocalError(null);
    const lower = file.name.toLowerCase();
    if (lower.endsWith(".txt")) {
      onFileSelected(file, "text");
    } else if (lower.endsWith(".zip")) {
      onFileSelected(file, "zip");
    } else {
      setLocalError(t("wrongFileType"));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const shownError = localError || error;

  const card = (
    <div className="w-full max-w-xl bg-wa-sidebar rounded-2xl shadow-xl ring-1 ring-wa-divider/40 p-6 sm:p-8 mx-auto">
      {showHeading && (
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-wa-green-dark to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-wa-green-dark/25">
            <i
              className="fa-brands fa-whatsapp text-white text-3xl"
              aria-hidden
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-wa-text tracking-tight">
            {t("appTitle")}
          </h1>
          <p className="text-sm sm:text-base text-wa-text-muted mt-2 max-w-md">
            {t("appDescription")}
          </p>
        </div>
      )}

      <div
        onDragOver={(e) => {
          if (isLoading) return;
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (isLoading) return;
          fileInputRef.current?.click();
        }}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-busy={isLoading}
        onKeyDown={(e) => {
          if (isLoading) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-7 sm:p-9 text-center transition-all duration-300 ${
          isLoading
            ? "border-wa-green bg-emerald-50/60 dark:bg-emerald-900/20 cursor-default"
            : isDragging
              ? "border-wa-green bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer scale-[1.01]"
              : "border-wa-divider/80 hover:border-wa-green/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 cursor-pointer"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-wa-green/0 via-wa-green/5 to-wa-green/0 opacity-0 transition-opacity duration-500"
          style={{ opacity: isDragging || isLoading ? 1 : 0 }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.zip,text/plain,application/zip"
          className="hidden"
          disabled={isLoading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        {isLoading ? (
          <>
            <CircularProgress progress={progress} />
            <p className="text-wa-text font-medium">{t("processing")}</p>
            {progress && progress.total > 0 && (
              <p className="text-sm text-wa-text-muted mt-1 tabular-nums">
                {progress.done} / {progress.total} {t("loadingFiles")}
              </p>
            )}
          </>
        ) : (
          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-wa-green-dark/10 to-emerald-400/10 text-wa-green-dark dark:from-white/10 dark:to-emerald-300/10 dark:text-wa-green flex items-center justify-center ring-1 ring-inset ring-wa-green-dark/10 dark:ring-white/10">
              <i
                className="fa-solid fa-cloud-arrow-up text-2xl"
                aria-hidden
              />
            </div>
            <p className="text-wa-text font-semibold tracking-tight">
              {t("uploadHeading")}
            </p>
            <p className="text-sm text-wa-text-muted mt-1.5">
              {t("dropUnified")}
            </p>
            <div className="mt-4 inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-wa-panel border border-wa-divider/70 text-wa-text-muted text-xs font-medium px-2.5 py-1 rounded-full">
                <i
                  className="fa-solid fa-file-lines text-[10px] text-wa-green-dark dark:text-wa-green"
                  aria-hidden
                />
                .txt
              </span>
              <span className="inline-flex items-center gap-1.5 bg-wa-panel border border-wa-divider/70 text-wa-text-muted text-xs font-medium px-2.5 py-1 rounded-full">
                <i
                  className="fa-solid fa-file-zipper text-[10px] text-wa-green-dark dark:text-wa-green"
                  aria-hidden
                />
                .zip
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Privacy badge */}
      <div className="mt-5 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-wa-green-dark dark:text-wa-green">
          <i className="fa-solid fa-shield-halved" aria-hidden />
          {t("privacyBadge")}
        </span>
      </div>

      {/* Language notice */}
      <div className="mt-4 p-3.5 rounded-xl border border-wa-divider/60 bg-wa-panel/40 text-xs text-wa-text-muted leading-relaxed flex items-start gap-2.5">
        <i
          className="fa-solid fa-circle-info text-wa-green-dark/80 dark:text-wa-green text-sm mt-0.5 shrink-0"
          aria-hidden
        />
        <p>{t("languageNotice")}</p>
      </div>

      {shownError && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300">
          {shownError}
        </div>
      )}

      <details className="mt-5 text-sm text-wa-text-muted">
        <summary className="cursor-pointer font-medium text-wa-text hover:text-wa-green-dark dark:hover:text-wa-green select-none">
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
  );

  if (variant === "card") {
    return card;
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-[#0b141a] dark:via-[#111b21] dark:to-[#0b141a]">
      {card}
    </div>
  );
}
