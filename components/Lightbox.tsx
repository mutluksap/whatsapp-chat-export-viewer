"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";

export type LightboxItem = {
  url: string;
  type: "image" | "video" | "sticker";
  filename: string;
};

export type LightboxStart = { index: number } | { gallery: true };

type Mode = "single" | "gallery";

type Props = {
  items: LightboxItem[];
  start: LightboxStart;
  onClose: () => void;
};

export default function Lightbox({ items, start, onClose }: Props) {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>(
    "gallery" in start ? "gallery" : "single",
  );
  const [index, setIndex] = useState<number>(
    "index" in start ? start.index : 0,
  );
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // When returning to the gallery from single view, jump to the previously
  // selected tile instead of scrolling back to the top.
  useEffect(() => {
    if (mode !== "gallery") return;
    const target = itemRefs.current[index];
    if (target) {
      target.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [mode, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (mode !== "single") return;
      if (e.key === "ArrowLeft" && index > 0) {
        setIndex(index - 1);
      } else if (e.key === "ArrowRight" && index < items.length - 1) {
        setIndex(index + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mode, index, items.length, onClose]);

  if (mode === "gallery") {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 text-white border-b border-white/10">
          <div className="text-sm font-medium">
            {t("gallery")}
            <span className="ml-2 text-white/60 tabular-nums">
              ({items.length})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 transition"
            aria-label={t("close")}
            title={t("close")}
          >
            <i className="fa-solid fa-xmark text-xl" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/70 text-sm">
              {t("noMedia")}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {items.map((it, i) => (
                <button
                  key={`${it.url}-${i}`}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setMode("single");
                  }}
                  className="relative aspect-square overflow-hidden rounded-md bg-white/5 hover:ring-2 hover:ring-wa-green focus:outline-none focus:ring-2 focus:ring-wa-green group"
                  title={it.filename}
                  aria-label={it.filename}
                >
                  {it.type === "video" ? (
                    <>
                      <video
                        src={it.url}
                        preload="metadata"
                        className="w-full h-full object-cover pointer-events-none"
                        muted
                        playsInline
                        onLoadedMetadata={(e) => {
                          // preload=metadata alone leaves the frame blank in
                          // Chromium; nudging currentTime forces the first
                          // frame to decode so we get a real thumbnail.
                          const v = e.currentTarget;
                          if (v.currentTime === 0) v.currentTime = 0.1;
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition pointer-events-none">
                        <span className="w-10 h-10 rounded-full bg-black/55 flex items-center justify-center">
                          <i
                            className="fa-solid fa-play text-white text-sm ml-0.5"
                            aria-hidden
                          />
                        </span>
                      </span>
                    </>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={it.url}
                      alt={it.filename}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const item = items[index];
  if (!item) return null;

  const canPrev = index > 0;
  const canNext = index < items.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 text-white pointer-events-none">
        <div className="text-sm truncate max-w-[50%] pointer-events-auto">
          {item.filename}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="text-sm text-white/80 tabular-nums">
            {index + 1} / {items.length}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMode("gallery");
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 transition"
            aria-label={t("gallery")}
            title={t("gallery")}
          >
            <i className="fa-solid fa-images text-lg" aria-hidden />
          </button>
          <a
            href={item.url}
            download={item.filename}
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 transition"
            aria-label="Download"
            title="Download"
          >
            <i className="fa-solid fa-download text-lg" aria-hidden />
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 transition"
            aria-label={t("close")}
            title={t("close")}
          >
            <i className="fa-solid fa-xmark text-xl" aria-hidden />
          </button>
        </div>
      </div>

      {/* Prev */}
      {canPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex(index - 1);
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition"
          aria-label={t("previous")}
          title={t("previous")}
        >
          <i className="fa-solid fa-chevron-left text-lg" aria-hidden />
        </button>
      )}

      {/* Next */}
      {canNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex(index + 1);
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition"
          aria-label={t("next")}
          title={t("next")}
        >
          <i className="fa-solid fa-chevron-right text-lg" aria-hidden />
        </button>
      )}

      {/* Content */}
      <div
        className="max-w-[92vw] max-h-[88vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "video" ? (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            className="max-w-[92vw] max-h-[88vh] rounded"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={item.url}
            src={item.url}
            alt={item.filename}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded"
          />
        )}
      </div>
    </div>
  );
}
