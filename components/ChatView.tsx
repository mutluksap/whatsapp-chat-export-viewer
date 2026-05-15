"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import type { Message } from "@/lib/types";
import { useChat, type LoadedChatRecord } from "./ChatProvider";
import Dropzone from "./Dropzone";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import Lightbox, { type LightboxItem, type LightboxStart } from "./Lightbox";
import StickyDatePill from "./StickyDatePill";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import ChatFilters, {
  type ChatFiltersValue,
  EMPTY_FILTERS,
  hasActiveFilters,
} from "./ChatFilters";
import {
  formatDateSeparator,
  formatTime,
  sameDayPublic,
} from "@/lib/format";
import { useI18n } from "./I18nProvider";

function chatPreviewText(
  chat: LoadedChatRecord,
  labels: {
    photo: string;
    video: string;
    audio: string;
    sticker: string;
    document: string;
  },
): { text: string; timestamp: Date | null } {
  const last = chat.messages[chat.messages.length - 1];
  if (!last) return { text: "", timestamp: null };
  const text = last.attachment
    ? last.attachment.type === "image"
      ? labels.photo
      : last.attachment.type === "video"
        ? labels.video
        : last.attachment.type === "audio"
          ? labels.audio
          : last.attachment.type === "sticker"
            ? labels.sticker
            : labels.document
    : (last.text || "").slice(0, 60);
  return { text, timestamp: last.timestamp ?? null };
}

export default function ChatView() {
  const { t, dict } = useI18n();
  const {
    chats,
    activeChat,
    activeChatId,
    selectChat,
    deleteChat,
    load,
    isLoading,
    progress,
    error: loadError,
    clearLoadingState,
  } = useChat();
  const [showSidebar, setShowSidebar] = useState(false);
  const [lightboxStart, setLightboxStart] = useState<LightboxStart | null>(
    null,
  );
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickFile = useCallback(() => {
    uploadInputRef.current?.click();
  }, []);

  // `load()` intentionally keeps isLoading=true on success so the Home page
  // can show 100% during navigation. When uploading from within /chats we're
  // already here, so clear the loading state after each in-chat upload to
  // re-enable the button.
  const handleUploadChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".txt")) await load(file, "text");
      else if (lower.endsWith(".zip")) await load(file, "zip");
      clearLoadingState();
    },
    [load, clearLoadingState],
  );

  const handleDropFile = useCallback(
    async (file: File, mode: "text" | "zip") => {
      await load(file, mode);
      clearLoadingState();
    },
    [load, clearLoadingState],
  );
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const virtuosoScrollerRef = useRef<HTMLElement | Window | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [matchPos, setMatchPos] = useState(0);
  const [filters, setFilters] = useState<ChatFiltersValue>(EMPTY_FILTERS);
  const filtersActive = hasActiveFilters(filters);
  const [searchOpen, setSearchOpen] = useState(false);

  const meSender = activeChat?.meSender ?? null;

  // Lock body scroll while the chat view is mounted so iOS rubber-banding
  // can't expose the panel background below `h-dvh` as a gap when the URL
  // bar collapses or when reaching the end of the scroller.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevOverscroll = body.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  const previewLabels = useMemo(
    () => ({
      photo: t("photoPreview"),
      video: t("videoPreview"),
      audio: t("audioPreview"),
      sticker: t("stickerPreview"),
      document: t("documentPreview"),
    }),
    [t],
  );

  // Ctrl/Cmd+F opens the search overlay; Esc closes it. Pressing Ctrl+F again
  // also toggles it off. Native browser find is replaced with our in-chat search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isFind = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f";
      if (isFind) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setFilters(EMPTY_FILTERS);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setFilters(EMPTY_FILTERS);
  }, []);

  // Reset volatile UI state whenever the active chat changes.
  useEffect(() => {
    setSearchOpen(false);
    setFilters(EMPTY_FILTERS);
    setMatchPos(0);
  }, [activeChatId]);

  // Filtering uses sender/date/media — but NOT the search query. The query is
  // used for highlighting + jump-to-match navigation, not for hiding messages.
  const hasNonQueryFilters =
    filters.senders.length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.mediaTypes.length > 0;

  const filteredMessages = useMemo(() => {
    const allMessages = activeChat?.messages ?? [];
    if (!hasNonQueryFilters) return allMessages;
    const from = filters.dateFrom
      ? new Date(filters.dateFrom + "T00:00:00")
      : null;
    const to = filters.dateTo
      ? new Date(filters.dateTo + "T23:59:59.999")
      : null;
    const senderSet = new Set(filters.senders);
    const mediaSet = new Set(filters.mediaTypes);
    return allMessages.filter((m) => {
      if (m.isSystem) return false;
      if (senderSet.size > 0 && (!m.sender || !senderSet.has(m.sender)))
        return false;
      if (from && m.timestamp && m.timestamp < from) return false;
      if (to && m.timestamp && m.timestamp > to) return false;
      if (mediaSet.size > 0) {
        const att = m.attachment;
        if (!att) {
          if (!mediaSet.has("text")) return false;
        } else if (!mediaSet.has(att.type)) {
          return false;
        }
      }
      return true;
    });
  }, [activeChat?.messages, filters.senders, filters.dateFrom, filters.dateTo, filters.mediaTypes, hasNonQueryFilters]);

  const scrollToBottom = useCallback(() => {
    const el = virtuosoScrollerRef.current as HTMLElement | null;
    if (!el) {
      virtuosoRef.current?.scrollToIndex({
        index: "LAST",
        behavior: "auto",
        align: "end",
      });
      return;
    }
    // Custom rAF easeOut scroll. Re-targets each frame so newly measured items
    // (which grow scrollHeight) don't leave us short like native smooth-scroll
    // does on a virtualized list. ~350ms feels fast yet smooth.
    const startTop = el.scrollTop;
    const startTime = performance.now();
    const duration = 350;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const target = el.scrollHeight - el.clientHeight;
      el.scrollTop = startTop + (target - startTop) * eased;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.scrollTop = el.scrollHeight - el.clientHeight;
      }
    };
    requestAnimationFrame(step);
  }, []);

  const isGroup = (activeChat?.participants?.length ?? 0) > 2;
  const otherParticipants = (activeChat?.participants ?? []).filter(
    (p) => p !== meSender,
  );
  const headerName =
    activeChat?.title ||
    (otherParticipants.length === 1
      ? otherParticipants[0]
      : otherParticipants.join(", ") || t("defaultChatTitle"));

  // Build flat list of viewable media (image/video/sticker) with URL
  const { lightboxItems, msgIdToMediaIndex } = useMemo(() => {
    const items: LightboxItem[] = [];
    const map = new Map<string, number>();
    for (const msg of activeChat?.messages ?? []) {
      const att = msg.attachment;
      if (
        att?.url &&
        (att.type === "image" || att.type === "video" || att.type === "sticker")
      ) {
        map.set(msg.id, items.length);
        items.push({
          url: att.url,
          type: att.type,
          filename: att.filename,
        });
      }
    }
    return { lightboxItems: items, msgIdToMediaIndex: map };
  }, [activeChat?.messages]);

  const handleMediaClick = useCallback(
    (messageId: string) => {
      const idx = msgIdToMediaIndex.get(messageId);
      if (idx !== undefined) setLightboxStart({ index: idx });
    },
    [msgIdToMediaIndex],
  );

  const openGallery = useCallback(() => {
    if (lightboxItems.length > 0) setLightboxStart({ gallery: true });
  }, [lightboxItems.length]);

  const visibleChats = useMemo(() => {
    const q = sidebarQuery.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, sidebarQuery]);

  type RenderItem =
    | { type: "separator"; id: string; date: Date }
    | {
        type: "message";
        id: string;
        message: Message;
        isOutgoing: boolean;
        showSender: boolean;
      };

  const items = useMemo<RenderItem[]>(() => {
    const out: RenderItem[] = [];
    let prevDate: Date | null = null;
    let prevSender: string | null = null;
    let prevTime: Date | null = null;

    filteredMessages.forEach((msg) => {
      if (msg.timestamp) {
        if (!prevDate || !sameDayPublic(prevDate, msg.timestamp)) {
          out.push({
            type: "separator",
            id: `sep-${msg.id}`,
            date: msg.timestamp,
          });
          prevDate = msg.timestamp;
        }
      }

      if (msg.isSystem) {
        out.push({
          type: "message",
          id: msg.id,
          message: msg,
          isOutgoing: false,
          showSender: false,
        });
        prevSender = null;
        prevTime = msg.timestamp;
        return;
      }

      const isOutgoing = meSender !== null && msg.sender === meSender;
      const gapBig =
        prevTime && msg.timestamp
          ? msg.timestamp.getTime() - prevTime.getTime() > 5 * 60 * 1000
          : true;
      const showSender = msg.sender !== prevSender || gapBig;

      out.push({
        type: "message",
        id: msg.id,
        message: msg,
        isOutgoing,
        showSender,
      });

      prevSender = msg.sender;
      prevTime = msg.timestamp;
    });

    return out;
  }, [filteredMessages, meSender]);

  // Pre-compute an estimated rendered height for each item so we can apply
  // `min-height` upfront. Virtuoso then measures the bubble at almost exactly
  // its estimated height — no scrollTop correction is needed when the item
  // first enters the rendered range, which is what was producing the "jump"
  // on mobile scroll-up (iOS momentum scrolling interrupted by JS scrollTop
  // assignment).
  const itemMinHeights = useMemo(() => {
    const out = new Array<number>(items.length);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type === "separator") {
        out[i] = 44;
        continue;
      }
      const m = it.message;
      if (m.isSystem) {
        out[i] = 48;
        continue;
      }
      const att = m.attachment;
      let h = 0;
      if (att?.type === "image" || att?.type === "sticker") {
        if (att.width && att.height) {
          // Bubble is clamped: max-w bubble ~65% of column; ~290px on mobile.
          // Image is `object-contain max-h-360`.
          const colW = 290;
          const renderedH = Math.min((att.height / att.width) * colW, 360);
          h = Math.ceil(renderedH);
        } else {
          h = att.type === "sticker" ? 160 : 240;
        }
      } else if (att?.type === "video") {
        h = 220;
      } else if (att?.type === "audio") {
        h = 64;
      } else if (att?.type === "document") {
        h = 56;
      }
      // Text contribution: rough single-line ≈ 22px, +24px chrome (padding,
      // timestamp). Wrapping ~32 chars/line on a 290px bubble.
      const text = m.text || "";
      const lines = text ? Math.max(1, Math.ceil(text.length / 32)) : 0;
      const textH = lines > 0 ? lines * 22 + 24 : 0;
      h += textH;
      // Sender label for group chats
      if (it.showSender && isGroup && !it.isOutgoing && m.sender) h += 18;
      // mt-2 gap when sender label or new sender block
      h += it.showSender ? 12 : 4;
      out[i] = Math.max(40, h);
    }
    return out;
  }, [items, isGroup]);

  // Use the MEDIAN, not the mean, so a handful of tall image bubbles don't
  // skew `defaultItemHeight` and over-estimate text-only items (which would
  // make Virtuoso's pre-render scrollHeight too big and cause a downward
  // correction on mobile scroll-up).
  const avgItemHeight = useMemo(() => {
    if (itemMinHeights.length === 0) return 80;
    const sorted = [...itemMinHeights].sort((a, b) => a - b);
    const mid = sorted[Math.floor(sorted.length / 2)];
    return Math.max(40, Math.round(mid));
  }, [itemMinHeights]);

  // Compute the indices (in `items`) of messages that match the search query.
  // Used both for highlighting and for the up/down arrow navigation.
  const matchIndices = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    if (!q) return [] as number[];
    const out: number[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type !== "message") continue;
      // Match against message text only — attachment filenames (e.g. IMG-0022.jpg)
      // would otherwise pollute results when searching numbers like "22".
      const tx = (it.message.text || "").toLowerCase();
      if (tx.includes(q)) out.push(i);
    }
    return out;
  }, [items, filters.query]);

  // When the query changes, jump back to the first match. Other changes
  // (matchPos navigation) keep their position.
  useEffect(() => {
    setMatchPos(0);
  }, [filters.query]);

  // Scroll the active match into view when matchPos or the match set changes.
  useEffect(() => {
    if (matchIndices.length === 0) return;
    const safePos = Math.min(matchPos, matchIndices.length - 1);
    const idx = matchIndices[safePos];
    if (idx === undefined) return;
    virtuosoRef.current?.scrollToIndex({
      index: idx,
      align: "center",
      behavior: "auto",
    });
  }, [matchPos, matchIndices]);

  const activeMatchIndex = matchIndices.length > 0
    ? matchIndices[Math.min(matchPos, matchIndices.length - 1)]
    : -1;

  // For each item index, store the date of the most recent separator at or
  // before it. Used by the floating sticky date pill that hovers over the
  // chat while scrolling — like WhatsApp's date header.
  const itemDates = useMemo(() => {
    const out: (Date | null)[] = new Array(items.length).fill(null);
    let cur: Date | null = null;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type === "separator") cur = it.date;
      out[i] = cur;
    }
    return out;
  }, [items]);

  const separatorIndices = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === "separator") s.add(i);
    }
    return s;
  }, [items]);

  // Stable getter for the Virtuoso scroller so the floating pill component
  // can attach its own scroll listener — it owns the scroll-driven state
  // internally, which keeps ChatView from re-rendering on every scroll frame.
  const getScroller = useCallback(
    () => virtuosoScrollerRef.current as HTMLElement | null,
    [],
  );

  const onPrevMatch = useCallback(() => {
    if (matchIndices.length === 0) return;
    setMatchPos((p) => (p - 1 + matchIndices.length) % matchIndices.length);
  }, [matchIndices.length]);

  const onNextMatch = useCallback(() => {
    if (matchIndices.length === 0) return;
    setMatchPos((p) => (p + 1) % matchIndices.length);
  }, [matchIndices.length]);

  return (
    <div className="h-dvh flex flex-col w-full bg-wa-chat-bg overflow-hidden">
      <div className="w-full flex-1 min-h-0 flex flex-col">
        <div className="overflow-hidden flex flex-1 min-h-0">
          {/* Sidebar — on mobile, show by default whenever no chat is loaded
              so the user always has access to navigation (back to home) and
              the upload action. When a chat is loaded, hide unless the user
              opens it via the hamburger in the chat header. */}
          <aside
            className={`${
              showSidebar || !activeChat
                ? "absolute inset-0 z-20 flex"
                : "hidden"
            } md:relative md:flex md:w-[380px] md:shrink-0 flex-col bg-wa-sidebar border-r border-wa-divider overflow-hidden`}
          >
            <div className="bg-wa-panel px-4 py-2.5 flex items-center justify-between gap-2">
              <Link
                href="/"
                className="group flex items-center shrink-0"
                title={t("navHome")}
                aria-label={t("brand")}
              >
                <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-wa-green-dark to-emerald-500 flex items-center justify-center shadow-sm shadow-wa-green-dark/25 transition-transform group-hover:scale-105">
                  <i
                    className="fa-brands fa-whatsapp text-white text-lg"
                    aria-hidden
                  />
                </span>
              </Link>
              <div className="flex items-center gap-1.5">
                <ThemeSwitcher />
                <LanguageSwitcher />
                {activeChat && (
                  <button
                    type="button"
                    onClick={() => setShowSidebar(false)}
                    className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-wa-text-muted hover:text-wa-text hover:bg-black/5 dark:hover:bg-white/10 transition shrink-0"
                    aria-label={t("close")}
                    title={t("close")}
                  >
                    <i
                      className="fa-solid fa-xmark text-base"
                      aria-hidden
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="px-3 py-2 bg-wa-sidebar">
              <div className="bg-wa-panel rounded-lg px-3 py-1.5 flex items-center gap-2 ring-1 ring-transparent focus-within:ring-wa-green/40 transition">
                <i
                  className="fa-solid fa-magnifying-glass text-xs text-wa-text-muted"
                  aria-hidden
                />
                <input
                  type="text"
                  value={sidebarQuery}
                  onChange={(e) => setSidebarQuery(e.target.value)}
                  placeholder={t("searchChats")}
                  className="flex-1 min-w-0 bg-transparent outline-none text-base sm:text-sm text-wa-text placeholder:text-wa-text-muted"
                />
                {sidebarQuery && (
                  <button
                    type="button"
                    onClick={() => setSidebarQuery("")}
                    className="text-wa-text-muted hover:text-wa-text shrink-0"
                    aria-label={t("close")}
                  >
                    <i className="fa-solid fa-xmark text-xs" aria-hidden />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="px-6 py-12 flex flex-col items-center text-center">
                  <span className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-wa-green-dark/15 to-emerald-400/10 dark:from-white/10 dark:to-emerald-300/10 ring-1 ring-inset ring-wa-green-dark/10 dark:ring-white/10 flex items-center justify-center mb-3">
                    <i
                      className="fa-regular fa-comments text-2xl text-wa-green-dark dark:text-wa-green"
                      aria-hidden
                    />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-wa-sidebar border-2 border-wa-panel flex items-center justify-center text-wa-text-muted">
                      <i
                        className="fa-solid fa-plus text-[10px]"
                        aria-hidden
                      />
                    </span>
                  </span>
                  <p className="text-sm font-medium text-wa-text">
                    {t("noChats")}
                  </p>
                  <p className="text-xs text-wa-text-muted mt-1 max-w-[200px]">
                    {t("dropUnified")}
                  </p>
                </div>
              ) : visibleChats.length === 0 ? (
                <div className="px-6 py-12 flex flex-col items-center text-center text-wa-text-muted">
                  <span className="w-12 h-12 rounded-full bg-wa-panel border border-wa-divider/60 flex items-center justify-center mb-2">
                    <i
                      className="fa-solid fa-magnifying-glass text-sm"
                      aria-hidden
                    />
                  </span>
                  <p className="text-sm">{t("noMatchingChats")}</p>
                </div>
              ) : (
                visibleChats.map((c) => {
                  const isActive = c.id === activeChatId;
                  const isConfirming = confirmDeleteId === c.id;
                  const preview = chatPreviewText(c, previewLabels);
                  if (isConfirming) {
                    return (
                      <div
                        key={c.id}
                        className="px-4 py-4 bg-wa-panel/60 border-y border-wa-divider/60 animate-fade-in-up"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="w-8 h-8 rounded-full bg-wa-green-dark/10 dark:bg-white/10 text-wa-green-dark dark:text-wa-green flex items-center justify-center shrink-0">
                            <i
                              className="fa-solid fa-triangle-exclamation text-xs"
                              aria-hidden
                            />
                          </span>
                          <p className="text-sm text-wa-text leading-snug">
                            {t("confirmDeleteChat")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteId(null);
                              deleteChat(c.id);
                            }}
                            className="flex-1 text-sm font-medium bg-wa-green-dark hover:bg-wa-green text-white px-3 py-1.5 rounded-lg shadow-sm transition"
                          >
                            {t("confirmYes")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 text-sm font-medium border border-wa-divider hover:border-wa-text-muted/40 text-wa-text px-3 py-1.5 rounded-lg transition"
                          >
                            {t("confirmNo")}
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={c.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => {
                          selectChat(c.id);
                          setShowSidebar(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition text-left ${
                          isActive
                            ? "bg-wa-raised"
                            : "bg-wa-panel hover:bg-wa-raised"
                        }`}
                        title={c.title}
                      >
                        <Avatar name={c.title} size={48} />
                        <div className="flex-1 min-w-0 pr-8">
                          <div className="flex items-center justify-between">
                            <div className="font-medium truncate">
                              {c.title}
                            </div>
                            {preview.timestamp && (
                              <div className="text-[11px] text-wa-text-muted shrink-0 ml-2">
                                {formatTime(preview.timestamp)}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-wa-text-muted truncate">
                            {preview.text}
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(c.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-wa-text-muted hover:text-wa-text hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition flex items-center justify-center"
                        title={t("deleteChat")}
                        aria-label={t("deleteChat")}
                      >
                        <i
                          className="fa-regular fa-trash-can text-xs"
                          aria-hidden
                        />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom-left: Upload new chat */}
            <div className="px-3 py-3 border-t border-wa-divider">
              <input
                ref={uploadInputRef}
                type="file"
                accept=".txt,.zip,text/plain,application/zip"
                className="hidden"
                onChange={handleUploadChange}
              />
              <button
                type="button"
                onClick={handlePickFile}
                disabled={isLoading}
                className="relative overflow-hidden w-full inline-flex items-center justify-center gap-2 bg-wa-green-dark hover:bg-wa-green text-white text-sm font-medium px-3 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:hover:shadow-sm disabled:hover:translate-y-0 disabled:cursor-progress"
              >
                {isLoading && (
                  <span
                    className="absolute inset-y-0 left-0 bg-white/25 transition-[width] duration-200 ease-out"
                    style={{
                      width:
                        progress && progress.total > 0
                          ? `${(progress.done / progress.total) * 100}%`
                          : "0%",
                    }}
                    aria-hidden
                  />
                )}
                <span className="relative inline-flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <i
                        className="fa-solid fa-circle-notch animate-spin"
                        aria-hidden
                      />
                      {progress && progress.total > 0
                        ? `${progress.done} / ${progress.total}`
                        : t("processing")}
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up" aria-hidden />
                      {t("uploadNewChat")}
                    </>
                  )}
                </span>
              </button>
            </div>

          </aside>

          {/* Chat panel */}
          <section className="flex-1 flex flex-col min-w-0 min-h-0">
            {!activeChat ? (
              <div className="flex-1 w-full flex items-center justify-center p-4 wa-chat-bg">
                <Dropzone
                  variant="card"
                  showHeading
                  onFileSelected={handleDropFile}
                  isLoading={isLoading}
                  progress={progress}
                  error={loadError}
                />
              </div>
            ) : (
              <>
            <header className="sticky top-0 z-10 bg-wa-panel px-3 sm:px-4 py-2 flex items-center gap-3 border-l border-wa-divider shrink-0">
              <button
                type="button"
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-1.5 -ml-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                aria-label={t("menu")}
              >
                <i
                  className="fa-solid fa-bars text-base text-wa-text"
                  aria-hidden
                />
              </button>
              <button
                type="button"
                onClick={openGallery}
                disabled={lightboxItems.length === 0}
                className="flex-1 min-w-0 flex items-center gap-3 -mx-1 px-1 py-0.5 rounded text-left hover:bg-black/5 dark:hover:bg-white/5 disabled:hover:bg-transparent disabled:cursor-default"
                title={
                  lightboxItems.length > 0 ? t("openGallery") : undefined
                }
                aria-label={t("openGallery")}
              >
                <Avatar name={headerName} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{headerName}</div>
                  <div className="text-xs text-wa-text-muted truncate">
                    {activeChat.participants.length > 0
                      ? t("participantCount", { n: activeChat.participants.length })
                      : ""}
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full text-wa-text-muted hover:text-wa-text hover:bg-black/5 dark:hover:bg-white/5 transition"
                title={t("searchInChat")}
                aria-label={t("searchInChat")}
              >
                <i
                  className="fa-solid fa-magnifying-glass text-base"
                  aria-hidden
                />
              </button>
            </header>

            {/* `grid-template-rows` interpolation is layout-heavy and stutters
                on lower-end mobile. `max-height` only invalidates a single
                axis and avoids reflowing the whole filter panel on every
                animation frame. */}
            <div
              className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                searchOpen
                  ? "max-h-[600px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
              aria-hidden={!searchOpen}
            >
              <ChatFilters
                value={filters}
                onChange={setFilters}
                participants={activeChat.participants}
                matchCount={filteredMessages.length}
                searchMatchCount={matchIndices.length}
                searchMatchIndex={matchPos}
                onPrevMatch={onPrevMatch}
                onNextMatch={onNextMatch}
                onClose={closeSearch}
                isOpen={searchOpen}
              />
            </div>

            <div className="flex-1 min-h-0 relative wa-chat-bg">
              {items.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-wa-text-muted text-sm px-6 text-center">
                  {filtersActive ? t("filterNoMatches") : t("noMessages")}
                </div>
              ) : null}
              {items.length > 0 && (
                <Virtuoso
                  ref={virtuosoRef}
                  scrollerRef={(ref) => {
                    virtuosoScrollerRef.current = ref;
                  }}
                  data={items}
                  followOutput
                  atBottomStateChange={setAtBottom}
                  atBottomThreshold={120}
                  // Larger top overscan so items entering from above are
                  // already measured before they reach the viewport — this
                  // is what prevents the visible "jump" on scroll-up when
                  // an unmeasured item's actual height differs from the
                  // `defaultItemHeight` estimate.
                  increaseViewportBy={{ top: 6000, bottom: 1500 }}
                  defaultItemHeight={avgItemHeight}
                  computeItemKey={(_, item) => item.id}
                  className="chat-scroll overscroll-contain"
                  style={{ position: "absolute", inset: 0 }}
                  itemContent={(index, item) => {
                    if (!item) return <div style={{ height: 1 }} />;
                    if (item.type === "separator") {
                      return (
                        <div className="flex justify-center my-3 px-4">
                          <div className="bg-wa-panel/95 text-wa-text-muted text-xs px-3 py-1.5 rounded-md shadow-sm">
                            {formatDateSeparator(item.date, dict)}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <MessageBubble
                        message={item.message}
                        isOutgoing={item.isOutgoing}
                        showSender={item.showSender}
                        isGroup={isGroup}
                        onMediaClick={handleMediaClick}
                        query={filters.query}
                        isActiveMatch={index === activeMatchIndex}
                      />
                    );
                  }}
                />
              )}
              {/* Floating sticky date pill — owns its own scroll listener so
                  ChatView doesn't re-render on every scroll frame. */}
              <StickyDatePill
                getScroller={getScroller}
                itemDates={itemDates}
                separatorIndices={separatorIndices}
                dict={dict}
                renderTick={items.length}
              />
              <button
                type="button"
                onClick={scrollToBottom}
                aria-label={t("scrollToBottom")}
                title={t("scrollToBottom")}
                className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-wa-panel shadow-lg flex items-center justify-center text-wa-text-muted hover:text-wa-text hover:bg-wa-raised transition-all duration-200 z-10 ${
                  !atBottom && items.length > 0
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
              >
                <i className="fa-solid fa-chevron-down text-base" aria-hidden />
              </button>
            </div>

              </>
            )}
          </section>
        </div>
      </div>

      {lightboxStart !== null && lightboxItems.length > 0 && (
        <Lightbox
          items={lightboxItems}
          start={lightboxStart}
          onClose={() => setLightboxStart(null)}
        />
      )}
    </div>
  );
}
