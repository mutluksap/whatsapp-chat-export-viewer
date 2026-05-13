"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import type { LoadedChat, Message } from "@/lib/types";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import Lightbox, { type LightboxItem, type LightboxStart } from "./Lightbox";
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

type Props = {
  chat: LoadedChat;
  chatTitle: string;
  meSender: string | null;
  onMeChange: (name: string) => void;
  onReset: () => void;
};

export default function ChatView({
  chat,
  chatTitle,
  meSender,
  onMeChange,
  onReset,
}: Props) {
  const { t, dict } = useI18n();
  const [showSidebar, setShowSidebar] = useState(false);
  const [lightboxStart, setLightboxStart] = useState<LightboxStart | null>(
    null,
  );
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [filters, setFilters] = useState<ChatFiltersValue>(EMPTY_FILTERS);
  const filtersActive = hasActiveFilters(filters);
  const [searchOpen, setSearchOpen] = useState(false);

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

  const filteredMessages = useMemo(() => {
    if (!filtersActive) return chat.messages;
    const q = filters.query.trim().toLowerCase();
    const from = filters.dateFrom
      ? new Date(filters.dateFrom + "T00:00:00")
      : null;
    const to = filters.dateTo
      ? new Date(filters.dateTo + "T23:59:59.999")
      : null;
    const senderSet = new Set(filters.senders);
    const mediaSet = new Set(filters.mediaTypes);
    return chat.messages.filter((m) => {
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
      if (q) {
        const tx = (m.text || "").toLowerCase();
        const fn = (m.attachment?.filename || "").toLowerCase();
        if (!tx.includes(q) && !fn.includes(q)) return false;
      }
      return true;
    });
  }, [chat.messages, filters, filtersActive]);

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: "LAST",
      behavior: "smooth",
      align: "end",
    });
  }, []);

  const isGroup = chat.participants.length > 2;
  const otherParticipants = chat.participants.filter((p) => p !== meSender);
  const headerName =
    chatTitle ||
    (otherParticipants.length === 1
      ? otherParticipants[0]
      : otherParticipants.join(", ") || t("defaultChatTitle"));

  // Build flat list of viewable media (image/video/sticker) with URL
  const { lightboxItems, msgIdToMediaIndex } = useMemo(() => {
    const items: LightboxItem[] = [];
    const map = new Map<string, number>();
    for (const msg of chat.messages) {
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
  }, [chat.messages]);

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

  const lastMessage = chat.messages[chat.messages.length - 1];
  const lastMessagePreview = lastMessage
    ? lastMessage.attachment
      ? lastMessage.attachment.type === "image"
        ? t("photoPreview")
        : lastMessage.attachment.type === "video"
          ? t("videoPreview")
          : lastMessage.attachment.type === "audio"
            ? t("audioPreview")
            : lastMessage.attachment.type === "sticker"
              ? t("stickerPreview")
              : t("documentPreview")
      : (lastMessage.text || "").slice(0, 60)
    : "";

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

  const renderItem = useCallback(
    (index: number, item: RenderItem) => {
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
        />
      );
    },
    [dict, isGroup, handleMediaClick],
  );

  return (
    <div className="h-dvh flex flex-col w-full bg-wa-bg overflow-hidden">
      <div className="w-full flex-1 min-h-0 flex flex-col">
        <div className="overflow-hidden flex flex-1 min-h-0">
          {/* Sidebar */}
          <aside
            className={`${
              showSidebar ? "absolute inset-0 z-20 flex" : "hidden"
            } md:relative md:flex md:w-[380px] md:shrink-0 flex-col bg-wa-sidebar border-r border-wa-divider overflow-hidden`}
          >
            <div className="bg-wa-panel px-4 py-2.5 flex items-center justify-between gap-2">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 font-medium text-wa-text hover:text-wa-green-dark dark:hover:text-wa-green transition"
                title={t("navHome")}
              >
                <span className="w-7 h-7 rounded-full bg-wa-green-dark flex items-center justify-center transition-transform group-hover:scale-105">
                  <i
                    className="fa-brands fa-whatsapp text-white text-sm"
                    aria-hidden
                  />
                </span>
                {t("chat")}
              </Link>
              <div className="flex items-center gap-1.5">
                <ThemeSwitcher />
                <LanguageSwitcher />
                <button
                  onClick={onReset}
                  className="text-xs text-wa-green-dark dark:text-wa-green hover:underline ml-1"
                  type="button"
                >
                  {t("loadNewFile")}
                </button>
              </div>
            </div>

            <div className="px-3 py-2 bg-wa-sidebar">
              <div className="bg-wa-panel rounded-lg px-3 py-1.5 flex items-center gap-2">
                <i
                  className="fa-solid fa-magnifying-glass text-xs text-wa-text-muted"
                  aria-hidden
                />
                <span className="text-sm text-wa-text-muted">
                  {t("searchChats")}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <button
                type="button"
                onClick={openGallery}
                className="w-full flex items-center gap-3 px-4 py-3 bg-wa-panel hover:bg-wa-raised transition text-left"
                title={t("openGallery")}
              >
                <Avatar name={headerName} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{headerName}</div>
                    {lastMessage?.timestamp && (
                      <div className="text-[11px] text-wa-text-muted shrink-0 ml-2">
                        {formatTime(lastMessage.timestamp)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-wa-text-muted truncate">
                    {lastMessagePreview}
                  </div>
                </div>
              </button>
            </div>

            <div className="px-4 py-3 border-t border-wa-divider">
              <div className="text-xs font-semibold text-wa-text-muted mb-2 uppercase tracking-wide">
                {t("pickMe")}
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {chat.participants.length === 0 && (
                  <div className="text-xs text-wa-text-muted">
                    {t("noParticipants")}
                  </div>
                )}
                {chat.participants.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onMeChange(p)}
                    className={`w-full text-left text-sm px-2 py-1 rounded ${
                      meSender === p
                        ? "bg-wa-green-dark text-white"
                        : "hover:bg-wa-raised text-wa-text"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-wa-text-muted mt-2 leading-relaxed">
                {t("pickMeHint")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSidebar(false)}
              className="md:hidden absolute top-2 right-2 p-2 text-white bg-black/30 rounded-full"
              aria-label={t("close")}
            >
              <i className="fa-solid fa-xmark text-base" aria-hidden />
            </button>
          </aside>

          {/* Chat panel */}
          <section className="flex-1 flex flex-col min-w-0 min-h-0">
            <header className="bg-wa-panel px-3 sm:px-4 py-2 flex items-center gap-3 border-l border-wa-divider">
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
                    {chat.participants.length > 0
                      ? t("participantCount", { n: chat.participants.length })
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
              {lightboxItems.length > 0 && (
                <button
                  type="button"
                  onClick={openGallery}
                  className="hidden md:flex items-center gap-1.5 text-sm text-wa-text-muted hover:text-wa-text px-2.5 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
                  title={t("openGallery")}
                  aria-label={t("openGallery")}
                >
                  <i
                    className="fa-solid fa-images text-base"
                    aria-hidden
                  />
                  <span className="hidden lg:inline">
                    {t("gallery")}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={onReset}
                className="hidden md:flex items-center gap-1.5 text-sm text-wa-text-muted hover:text-wa-text px-2.5 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
              >
                <i className="fa-solid fa-plus text-base" aria-hidden />
                {t("newFile")}
              </button>
            </header>

            {searchOpen && (
              <ChatFilters
                value={filters}
                onChange={setFilters}
                participants={chat.participants}
                matchCount={filteredMessages.length}
                onClose={closeSearch}
                autoFocus
              />
            )}

            <div className="flex-1 min-h-0 relative wa-chat-bg">
              {items.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-wa-text-muted text-sm px-6 text-center">
                  {filtersActive ? t("filterNoMatches") : t("noMessages")}
                </div>
              ) : (
                <Virtuoso
                  ref={virtuosoRef}
                  totalCount={items.length}
                  followOutput
                  atBottomStateChange={setAtBottom}
                  atBottomThreshold={120}
                  increaseViewportBy={600}
                  className="chat-scroll"
                  style={{ position: "absolute", inset: 0 }}
                  itemContent={(index) => {
                    const item = items[index];
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
                      />
                    );
                  }}
                />
              )}
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

            <footer className="bg-wa-panel px-3 sm:px-4 py-2.5 flex items-center gap-3">
              <i
                className="fa-regular fa-face-smile text-xl text-wa-text-muted"
                aria-hidden
              />
              <i
                className="fa-solid fa-paperclip text-xl text-wa-text-muted"
                aria-hidden
              />
              <div className="flex-1 bg-wa-raised rounded-full px-4 py-2 text-sm text-wa-text-muted select-none">
                {t("footerHint")}
              </div>
              <i
                className="fa-solid fa-microphone text-xl text-wa-text-muted"
                aria-hidden
              />
            </footer>
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
