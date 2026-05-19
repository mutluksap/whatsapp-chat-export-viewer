"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";
import { useMediaUrl } from "./useMediaUrl";

export type LightboxItem = {
  filename: string;
  type: "image" | "video" | "sticker";
};

export type LightboxStart = { index: number } | { gallery: true };

type Mode = "single" | "gallery";

type Props = {
  items: LightboxItem[];
  start: LightboxStart;
  onClose: () => void;
};

/**
 * A single gallery tile. Uses IntersectionObserver to only resolve media
 * for tiles that are at or near the viewport — without this, opening the
 * gallery on a media-heavy chat would resolve hundreds of blobs at once
 * and exhaust mobile Safari's blob memory budget.
 */
function GalleryTile({
  item,
  onClick,
  registerRef,
}: {
  item: LightboxItem;
  onClick: () => void;
  registerRef: (el: HTMLButtonElement | null) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const media = useMediaUrl(visible ? item.filename : undefined);

  return (
    <button
      ref={(el) => {
        buttonRef.current = el;
        registerRef(el);
      }}
      type="button"
      onClick={onClick}
      className="relative aspect-square overflow-hidden rounded-md bg-white/5 hover:ring-2 hover:ring-wa-green focus:outline-none focus:ring-2 focus:ring-wa-green group"
      title={item.filename}
      aria-label={item.filename}
    >
      {!media ? (
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
      ) : item.type === "video" ? (
        <>
          <video
            src={media.url}
            preload="metadata"
            className="w-full h-full object-cover pointer-events-none"
            muted
            playsInline
            onLoadedMetadata={(e) => {
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
          src={media.url}
          alt={item.filename}
          className="w-full h-full object-cover"
        />
      )}
    </button>
  );
}

function SingleContent({ item }: { item: LightboxItem }) {
  const media = useMediaUrl(item.filename);
  if (!media) {
    return (
      <div className="w-64 h-64 bg-white/10 rounded animate-pulse" />
    );
  }
  return item.type === "video" ? (
    <video
      key={media.url}
      src={media.url}
      controls
      autoPlay
      className="max-w-[92vw] max-h-[88vh] rounded"
    />
  ) : (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      key={media.url}
      src={media.url}
      alt={item.filename}
      className="max-w-[92vw] max-h-[88vh] object-contain rounded"
    />
  );
}

function DownloadButton({
  item,
  label,
}: {
  item: LightboxItem;
  label: string;
}) {
  const media = useMediaUrl(item.filename);
  if (!media) {
    return (
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center opacity-40"
        aria-hidden
      >
        <i className="fa-solid fa-download text-lg" />
      </span>
    );
  }
  return (
    <a
      href={media.url}
      download={item.filename}
      onClick={(e) => e.stopPropagation()}
      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 transition"
      aria-label={label}
      title={label}
    >
      <i className="fa-solid fa-download text-lg" aria-hidden />
    </a>
  );
}

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
                <GalleryTile
                  key={`${it.filename}-${i}`}
                  item={it}
                  registerRef={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  onClick={() => {
                    setIndex(i);
                    setMode("single");
                  }}
                />
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
          <DownloadButton item={item} label="Download" />
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
        <SingleContent item={item} />
      </div>
    </div>
  );
}
