"use client";

import { memo, useEffect, useState } from "react";
import type { Dict } from "@/lib/i18n";
import { formatDateSeparator } from "@/lib/format";

type Props = {
  /** Function that returns the current scroller element (Virtuoso's). */
  getScroller: () => HTMLElement | null;
  /** For each item index, the date of the section it belongs to. */
  itemDates: (Date | null)[];
  /** Indices that are section separators — pill hides while one is at top. */
  separatorIndices: Set<number>;
  /** Localized date strings come from the same dict ChatView uses. */
  dict: Dict;
  /** Bumped whenever Virtuoso renders, so we re-scan the visible top. */
  renderTick: number;
};

/**
 * Floating WhatsApp-style date header.
 *
 * Lives in its own component so the scroll-driven `topVisibleIndex` state
 * doesn't trigger a re-render of the parent (ChatView) every animation
 * frame. On lower-end mobile, parent re-renders during scroll were stealing
 * frame budget from the native scroller and contributing to scroll-up jitter.
 */
function StickyDatePillBase({
  getScroller,
  itemDates,
  separatorIndices,
  dict,
  renderTick,
}: Props) {
  const [topIndex, setTopIndex] = useState(0);

  useEffect(() => {
    const scroller = getScroller();
    if (!scroller) return;
    let rafId = 0;
    const update = () => {
      const sRect = scroller.getBoundingClientRect();
      const elems = scroller.querySelectorAll<HTMLElement>("[data-item-index]");
      for (const el of elems) {
        const r = el.getBoundingClientRect();
        if (r.bottom > sRect.top + 1) {
          const idx = Number(el.getAttribute("data-item-index"));
          if (!Number.isNaN(idx)) setTopIndex(idx);
          return;
        }
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
    // `renderTick` makes us re-run when Virtuoso swaps items in/out of DOM —
    // the scroll listener stays attached, but we also need a fresh measure
    // after `itemsRendered` fires (which the parent forwards via `renderTick`).
  }, [getScroller, renderTick]);

  if (itemDates.length === 0) return null;
  const safeIdx = Math.max(0, Math.min(topIndex, itemDates.length - 1));
  if (safeIdx <= 0) return null;
  if (separatorIndices.has(safeIdx)) return null;
  const date = itemDates[safeIdx];
  if (!date) return null;

  return (
    <div
      className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-10 opacity-100 transition-opacity duration-200"
      aria-hidden
    >
      <div className="bg-wa-panel/95 text-wa-text-muted text-xs px-3 py-1.5 rounded-md shadow-sm">
        {formatDateSeparator(date, dict)}
      </div>
    </div>
  );
}

export default memo(StickyDatePillBase);
