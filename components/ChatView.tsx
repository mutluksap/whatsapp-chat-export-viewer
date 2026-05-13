"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import type { LoadedChat, Message } from "@/lib/types";
import { useChat } from "./ChatProvider";
import Dropzone from "./Dropzone";
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
  chat: LoadedChat | null;
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
  const { load, isLoading, progress, error: loadError } = useChat();
  const [showSidebar, setShowSidebar] = useState(false);
  const [lightboxStart, setLightboxStart] = useState<LightboxStart | null>(
    null,
  );
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickFile = useCallback(() => {
    uploadInputRef.current?.click();
  }, []);

  const handleUploadChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".txt")) load(file, "text");
      else if (lower.endsWith(".zip")) load(file, "zip");
    },
    [load],
  );

  const handleDropFile = useCallback(
    (file: File, mode: "text" | "zip") => {
      load(file, mode);
    },
    [load],
  );
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [matchPos, setMatchPos] = useState(0);
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

  // Reset volatile UI state whenever the loaded chat changes.
  useEffect(() => {
    setConfirmDelete(false);
    setSidebarQuery("");
    setSearchOpen(false);
    setFilters(EMPTY_FILTERS);
  }, [chat?.messages]);

  // Filtering uses sender/date/media — but NOT the search query. The query is
  // used for highlighting + jump-to-match navigation, not for hiding messages.
  const hasNonQueryFilters =
    filters.senders.length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.mediaTypes.length > 0;

  const filteredMessages = useMemo(() => {
    const allMessages = chat?.messages ?? [];
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
  }, [chat?.messages, filters.senders, filters.dateFrom, filters.dateTo, filters.mediaTypes, hasNonQueryFilters]);

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: "LAST",
      behavior: "smooth",
      align: "end",
    });
  }, []);

  const isGroup = (chat?.participants?.length ?? 0) > 2;
  const otherParticipants = (chat?.participants ?? []).filter(
    (p) => p !== meSender,
  );
  const headerName =
    chatTitle ||
    (otherParticipants.length === 1
      ? otherParticipants[0]
      : otherParticipants.join(", ") || t("defaultChatTitle"));

  // Build flat list of viewable media (image/video/sticker) with URL
  const { lightboxItems, msgIdToMediaIndex } = useMemo(() => {
    const items: LightboxItem[] = [];
    const map = new Map<string, number>();
    for (const msg of chat?.messages ?? []) {
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
  }, [chat?.messages]);

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

  const lastMessage = chat
    ? chat.messages[chat.messages.length - 1]
    : undefined;
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

  // Compute the indices (in `items`) of messages that match the search query.
  // Used both for highlighting and for the up/down arrow navigation.
  const matchIndices = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    if (!q) return [] as number[];
    const out: number[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type !== "message") continue;
      const tx = (it.message.text || "").toLowerCase();
      const fn = (it.message.attachment?.filename || "").toLowerCase();
      if (tx.includes(q) || fn.includes(q)) out.push(i);
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
      behavior: "smooth",
    });
  }, [matchPos, matchIndices]);

  const activeMatchIndex = matchIndices.length > 0
    ? matchIndices[Math.min(matchPos, matchIndices.length - 1)]
    : -1;

  const onPrevMatch = useCallback(() => {
    if (matchIndices.length === 0) return;
    setMatchPos((p) => (p - 1 + matchIndices.length) % matchIndices.length);
  }, [matchIndices.length]);

  const onNextMatch = useCallback(() => {
    if (matchIndices.length === 0) return;
    setMatchPos((p) => (p + 1) % matchIndices.length);
  }, [matchIndices.length]);

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
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm text-wa-text placeholder:text-wa-text-muted"
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
              {chat &&
              (!sidebarQuery ||
                headerName
                  .toLowerCase()
                  .includes(sidebarQuery.toLowerCase())) ? (
                confirmDelete ? (
                  <div className="px-4 py-4 bg-wa-panel/60 border-y border-wa-divider/60 animate-fade-in-up">
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
                          setConfirmDelete(false);
                          onReset();
                        }}
                        className="flex-1 text-sm font-medium bg-wa-green-dark hover:bg-wa-green text-white px-3 py-1.5 rounded-lg shadow-sm transition"
                      >
                        {t("confirmYes")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 text-sm font-medium border border-wa-divider hover:border-wa-text-muted/40 text-wa-text px-3 py-1.5 rounded-lg transition"
                      >
                        {t("confirmNo")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group relative">
                    <button
                      type="button"
                      onClick={openGallery}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-wa-panel hover:bg-wa-raised transition text-left"
                      title={t("openGallery")}
                    >
                      <Avatar name={headerName} size={48} />
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate">
                            {headerName}
                          </div>
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(true);
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
                )
              ) : !chat ? (
                <div className="px-4 py-8 text-center text-sm text-wa-text-muted">
                  {t("noChats")}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-wa-text-muted">
                  {t("noMatchingChats")}
                </div>
              )}
            </div>

            {chat && (
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
            )}

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
                className="w-full inline-flex items-center justify-center gap-2 bg-wa-green-dark hover:bg-wa-green text-white text-sm font-medium px-3 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                disabled={isLoading}
              >
                <i className="fa-solid fa-cloud-arrow-up" aria-hidden />
                {t("uploadNewChat")}
              </button>
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
            {!chat ? (
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
            </header>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
                searchOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
              aria-hidden={!searchOpen}
            >
              <div className="min-h-0 overflow-hidden">
                <ChatFilters
                  value={filters}
                  onChange={setFilters}
                  participants={chat.participants}
                  matchCount={filteredMessages.length}
                  searchMatchCount={matchIndices.length}
                  searchMatchIndex={matchPos}
                  onPrevMatch={onPrevMatch}
                  onNextMatch={onNextMatch}
                  onClose={closeSearch}
                  isOpen={searchOpen}
                />
              </div>
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
                        query={filters.query}
                        isActiveMatch={index === activeMatchIndex}
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
