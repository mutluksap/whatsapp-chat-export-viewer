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
  /** Total number of in-chat search hits (independent of filter results). */
  searchMatchCount?: number;
  /** Current position within search hits (0-based). */
  searchMatchIndex?: number;
  onPrevMatch?: () => void;
  onNextMatch?: () => void;
  onClose?: () => void;
  /** Becomes true when the filter panel is open. Toggling this re-focuses the search input. */
  isOpen?: boolean;
};

export default function ChatFilters({
  value,
  onChange,
  participants,
  matchCount,
  searchMatchCount = 0,
  searchMatchIndex = 0,
  onPrevMatch,
  onNextMatch,
  onClose,
  isOpen,
}: Props) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Wait a frame so the open transition starts before focusing,
      // otherwise the focus ring jumps before the panel slides in.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  const active = hasActiveFilters(value);
  const hasNonQueryFilters =
    value.senders.length > 0 ||
    !!value.dateFrom ||
    !!value.dateTo ||
    value.mediaTypes.length > 0;

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
        <div className="flex-1 min-w-0 flex items-center gap-2 bg-wa-raised rounded-full px-3 py-1.5 ring-1 ring-wa-divider/40 focus-within:ring-wa-green/50 transition">
          <i
            className="fa-solid fa-magnifying-glass text-xs text-wa-text-muted"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="text"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.shiftKey ? onPrevMatch : onNextMatch)?.();
              }
            }}
            placeholder={t("filterSearchPlaceholder")}
            className="flex-1 min-w-0 bg-transparent outline-none text-base sm:text-sm text-wa-text placeholder:text-wa-text-muted"
          />
          {value.query && (
            <>
              <span className="text-[11px] text-wa-text-muted tabular-nums shrink-0 select-none">
                {searchMatchCount > 0
                  ? `${searchMatchIndex + 1} / ${searchMatchCount}`
                  : t("noMatches")}
              </span>
              <button
                type="button"
                onClick={onPrevMatch}
                disabled={searchMatchCount === 0}
                className="shrink-0 w-6 h-6 rounded-full text-wa-text-muted hover:text-wa-text hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-wa-text-muted"
                aria-label={t("prevMatch")}
                title={t("prevMatch")}
              >
                <i className="fa-solid fa-chevron-up text-[10px]" aria-hidden />
              </button>
              <button
                type="button"
                onClick={onNextMatch}
                disabled={searchMatchCount === 0}
                className="shrink-0 w-6 h-6 rounded-full text-wa-text-muted hover:text-wa-text hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-wa-text-muted"
                aria-label={t("nextMatch")}
                title={t("nextMatch")}
              >
                <i className="fa-solid fa-chevron-down text-[10px]" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...value, query: "" })}
                className="text-wa-text-muted hover:text-wa-text shrink-0"
                aria-label={t("close")}
              >
                <i className="fa-solid fa-xmark text-xs" aria-hidden />
              </button>
            </>
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

      {hasNonQueryFilters && (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-wa-text-muted block mb-1">
                {t("filterDateFromLabel")}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={value.dateFrom}
                  onChange={(e) =>
                    onChange({ ...value, dateFrom: e.target.value })
                  }
                  className="flex-1 min-w-0 bg-wa-raised border border-wa-divider/60 text-sm text-wa-text rounded-lg px-2 py-1.5 outline-none focus:border-wa-green/50"
                />
                {value.dateFrom && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...value, dateFrom: "" })}
                    className="shrink-0 w-8 h-8 rounded-full bg-wa-raised border border-wa-divider/60 text-wa-text-muted hover:text-wa-text hover:border-wa-text-muted/40 flex items-center justify-center transition"
                    aria-label={t("filterClearAll")}
                    title={t("filterClearAll")}
                  >
                    <i
                      className="fa-solid fa-xmark text-xs"
                      aria-hidden
                    />
                  </button>
                )}
              </div>
            </label>
            <label className="block min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-wa-text-muted block mb-1">
                {t("filterDateToLabel")}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={value.dateTo}
                  onChange={(e) =>
                    onChange({ ...value, dateTo: e.target.value })
                  }
                  className="flex-1 min-w-0 bg-wa-raised border border-wa-divider/60 text-sm text-wa-text rounded-lg px-2 py-1.5 outline-none focus:border-wa-green/50"
                />
                {value.dateTo && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...value, dateTo: "" })}
                    className="shrink-0 w-8 h-8 rounded-full bg-wa-raised border border-wa-divider/60 text-wa-text-muted hover:text-wa-text hover:border-wa-text-muted/40 flex items-center justify-center transition"
                    aria-label={t("filterClearAll")}
                    title={t("filterClearAll")}
                  >
                    <i
                      className="fa-solid fa-xmark text-xs"
                      aria-hidden
                    />
                  </button>
                )}
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
