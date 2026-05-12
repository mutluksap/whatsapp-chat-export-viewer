"use client";

import { useCallback, useMemo, useState } from "react";
import type { LoadedChat } from "@/lib/types";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import Lightbox, { type LightboxItem } from "./Lightbox";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
      if (idx !== undefined) setLightboxIndex(idx);
    },
    [msgIdToMediaIndex],
  );

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

  const rendered = useMemo(() => {
    const out: React.ReactNode[] = [];
    let prevDate: Date | null = null;
    let prevSender: string | null = null;
    let prevTime: Date | null = null;

    chat.messages.forEach((msg) => {
      if (msg.timestamp) {
        if (!prevDate || !sameDayPublic(prevDate, msg.timestamp)) {
          out.push(
            <div
              key={`sep-${msg.id}`}
              className="flex justify-center my-3 px-4"
            >
              <div className="bg-wa-panel/95 text-wa-text-muted text-xs px-3 py-1.5 rounded-md shadow-sm">
                {formatDateSeparator(msg.timestamp, dict)}
              </div>
            </div>,
          );
          prevDate = msg.timestamp;
        }
      }

      if (msg.isSystem) {
        out.push(
          <MessageBubble
            key={msg.id}
            message={msg}
            isOutgoing={false}
            showSender={false}
            isGroup={isGroup}
          />,
        );
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

      out.push(
        <MessageBubble
          key={msg.id}
          message={msg}
          isOutgoing={isOutgoing}
          showSender={showSender}
          isGroup={isGroup}
          onMediaClick={handleMediaClick}
        />,
      );

      prevSender = msg.sender;
      prevTime = msg.timestamp;
    });

    return out;
  }, [chat.messages, meSender, isGroup, dict, handleMediaClick]);

  return (
    <div className="min-h-screen w-full bg-wa-bg">
      <div className="hidden md:block h-[18px] bg-wa-green-dark" />
      <div className="md:max-w-[1600px] md:mx-auto md:px-4 md:-mt-[18px]">
        <div className="md:shadow-2xl md:rounded-sm overflow-hidden flex h-screen md:h-[calc(100vh-30px)]">
          {/* Sidebar */}
          <aside
            className={`${
              showSidebar ? "absolute inset-0 z-20 flex" : "hidden"
            } md:relative md:flex md:w-[380px] md:shrink-0 flex-col bg-wa-sidebar border-r border-wa-divider`}
          >
            <div className="bg-wa-panel px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="font-medium text-wa-text">{t("chat")}</div>
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
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-wa-text-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  />
                </svg>
                <span className="text-sm text-wa-text-muted">
                  {t("searchChats")}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 px-4 py-3 bg-wa-panel cursor-default">
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
              </div>
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
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </aside>

          {/* Chat panel */}
          <section className="flex-1 flex flex-col min-w-0">
            <header className="bg-wa-panel px-3 sm:px-4 py-2 flex items-center gap-3 border-l border-wa-divider">
              <button
                type="button"
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-1.5 -ml-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                aria-label={t("menu")}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-wa-text"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
              <Avatar name={headerName} size={40} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{headerName}</div>
                <div className="text-xs text-wa-text-muted truncate">
                  {chat.participants.length > 0
                    ? t("participantCount", { n: chat.participants.length })
                    : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="hidden md:flex items-center gap-1.5 text-sm text-wa-text-muted hover:text-wa-text px-2.5 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                {t("newFile")}
              </button>
            </header>

            <div className="flex-1 overflow-y-auto chat-scroll wa-chat-bg py-3">
              {rendered}
              {chat.messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-wa-text-muted text-sm px-6 text-center">
                  {t("noMessages")}
                </div>
              )}
            </div>

            <footer className="bg-wa-panel px-3 sm:px-4 py-2.5 flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-wa-text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                />
              </svg>
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-wa-text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81"
                />
              </svg>
              <div className="flex-1 bg-wa-raised rounded-full px-4 py-2 text-sm text-wa-text-muted select-none">
                {t("footerHint")}
              </div>
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-wa-text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </footer>
          </section>
        </div>
      </div>

      {lightboxIndex !== null && lightboxItems.length > 0 && (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
