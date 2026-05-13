"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";

export type MediaFilter =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "sticker";

export type ChatFiltersValue = {
  query: string;
  senders: string[];
  dateFrom: string;
  dateTo: string;
  mediaTypes: MediaFilter[];
};

export const EMPTY_FILTERS: ChatFiltersValue = {
  query: "",
  senders: [],
  dateFrom: "",
  dateTo: "",
  mediaTypes: [],
};

export function hasActiveFilters(v: ChatFiltersValue): boolean {
  return (
    !!v.query.trim() ||
    v.senders.length > 0 ||
    !!v.dateFrom ||
    !!v.dateTo ||
    v.mediaTypes.length > 0
  );
}

type Props = {
  value: ChatFiltersValue;
  onChange: (v: ChatFiltersValue) => void;
  participants: string[];
  matchCount: number;
  onClose?: () => void;
  autoFocus?: boolean;
};

export default function ChatFilters({
  value,
  onChange,
  participants,
  matchCount,
  onClose,
  autoFocus,
}: Props) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const active = hasActiveFilters(value);

  const mediaTypes: { key: MediaFilter; label: string; icon: string }[] = [
    { key: "image", label: t("filterPhoto"), icon: "fa-image" },
    { key: "video", label: t("filterVideo"), icon: "fa-video" },
    { key: "audio", label: t("filterAudio"), icon: "fa-microphone" },
    { key: "document", label: t("filterDocument"), icon: "fa-file-lines" },
    { key: "sticker", label: t("filterSticker"), icon: "fa-face-smile" },
    { key: "text", label: t("filterTextOnly"), icon: "fa-message" },
  ];

  const toggleSender = (s: string) => {
    const has = value.senders.includes(s);
    onChange({
      ...value,
      senders: has ? value.senders.filter((x) => x !== s) : [...value.senders, s],
    });
  };

  const toggleMedia = (m: MediaFilter) => {
    const has = value.mediaTypes.includes(m);
    onChange({
      ...value,
      mediaTypes: has
        ? value.mediaTypes.filter((x) => x !== m)
        : [...value.mediaTypes, m],
    });
  };

  return (
    <div className="bg-wa-panel/70 backdrop-blur-sm border-b border-wa-divider/60 shrink-0">
      <div className="px-3 sm:px-4 py-2.5 flex items-center gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-wa-text-muted hover:text-wa-text flex items-center justify-center transition"
            aria-label={t("closeSearch")}
            title={t("closeSearch")}
          >
            <i className="fa-solid fa-arrow-left text-sm" aria-hidden />
          </button>
        )}
        <div className="flex-1 flex items-center gap-2 bg-wa-raised rounded-full px-3 py-1.5 ring-1 ring-wa-divider/40 focus-within:ring-wa-green/50 transition">
          <i
            className="fa-solid fa-magnifying-glass text-xs text-wa-text-muted"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="text"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            placeholder={t("filterSearchPlaceholder")}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-wa-text placeholder:text-wa-text-muted"
          />
          {value.query && (
            <button
              type="button"
              onClick={() => onChange({ ...value, query: "" })}
              className="text-wa-text-muted hover:text-wa-text shrink-0"
              aria-label={t("close")}
            >
              <i className="fa-solid fa-xmark text-xs" aria-hidden />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`shrink-0 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition ${
            active || expanded
              ? "border-wa-green/50 bg-wa-green-dark/10 text-wa-green-dark dark:text-wa-green dark:bg-white/5"
              : "border-wa-divider/60 text-wa-text-muted hover:text-wa-text"
          }`}
          aria-pressed={expanded}
        >
          <i className="fa-solid fa-sliders text-xs" aria-hidden />
          <span className="hidden sm:inline">
            {expanded ? t("filterHideFilters") : t("filterShowFilters")}
          </span>
          {active && (
            <span className="w-1.5 h-1.5 rounded-full bg-wa-green-dark dark:bg-wa-green" />
          )}
        </button>
        {active && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs text-wa-text-muted hover:text-wa-text px-2.5 py-1.5 rounded-full"
          >
            <i className="fa-solid fa-rotate-left text-[10px]" aria-hidden />
            <span className="hidden sm:inline">{t("filterClearAll")}</span>
          </button>
        )}
      </div>

      {active && (
        <div className="px-3 sm:px-4 pb-2 text-xs text-wa-text-muted tabular-nums">
          {t("filterMatchesCount", { n: String(matchCount) })}
        </div>
      )}

      {expanded && (
        <div className="px-3 sm:px-4 py-3 border-t border-wa-divider/60 space-y-4">
          {participants.length > 1 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-wa-text-muted mb-2">
                {t("filterSenderLabel")}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {participants.map((p) => {
                  const isActive = value.senders.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleSender(p)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition ${
                        isActive
                          ? "bg-wa-green-dark text-white border-wa-green-dark"
                          : "border-wa-divider/60 text-wa-text-muted hover:text-wa-text hover:border-wa-green/40"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-wa-text-muted mb-2">
              {t("filterMediaTypeLabel")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mediaTypes.map((mt) => {
                const isActive = value.mediaTypes.includes(mt.key);
                return (
                  <button
                    key={mt.key}
                    type="button"
                    onClick={() => toggleMedia(mt.key)}
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition ${
                      isActive
                        ? "bg-wa-green-dark text-white border-wa-green-dark"
                        : "border-wa-divider/60 text-wa-text-muted hover:text-wa-text hover:border-wa-green/40"
                    }`}
                  >
                    <i
                      className={`fa-solid ${mt.icon} text-[10px]`}
                      aria-hidden
                    />
                    {mt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-wa-text-muted block mb-1">
                {t("filterDateFromLabel")}
              </span>
              <input
                type="date"
                value={value.dateFrom}
                onChange={(e) =>
                  onChange({ ...value, dateFrom: e.target.value })
                }
                className="w-full bg-wa-raised border border-wa-divider/60 text-sm text-wa-text rounded-lg px-3 py-1.5 outline-none focus:border-wa-green/50"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-wa-text-muted block mb-1">
                {t("filterDateToLabel")}
              </span>
              <input
                type="date"
                value={value.dateTo}
                onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
                className="w-full bg-wa-raised border border-wa-divider/60 text-sm text-wa-text rounded-lg px-3 py-1.5 outline-none focus:border-wa-green/50"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
