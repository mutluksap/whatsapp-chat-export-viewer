import { memo } from "react";
import type { Message } from "@/lib/types";
import { colorFromName, formatTime } from "@/lib/format";
import { useI18n } from "./I18nProvider";

const URL_RE = /(https?:\/\/[^\s]+)/g;

function renderText(text: string) {
  if (!text) return null;
  return text.split("\n").map((line, lineIdx) => {
    const parts = line.split(URL_RE);
    return (
      <span key={lineIdx} className="block break-words">
        {parts.map((part, i) => {
          if (!part) return null;
          if (i % 2 === 1) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 dark:text-sky-400 underline break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  });
}

function AttachmentView({
  message,
  onMediaClick,
}: {
  message: Message;
  onMediaClick?: (messageId: string) => void;
}) {
  const { t } = useI18n();
  const att = message.attachment;
  if (!att) return null;

  if (!att.url) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded bg-black/5 dark:bg-white/10 text-sm text-wa-text-muted">
        <i className="fa-solid fa-paperclip text-base shrink-0" aria-hidden />
        <span>{att.filename ? att.filename : t("mediaNotIncluded")}</span>
      </div>
    );
  }

  if (att.type === "image" || att.type === "sticker") {
    const isSticker = att.type === "sticker";
    return (
      <button
        type="button"
        onClick={() => onMediaClick?.(message.id)}
        className={
          isSticker
            ? "block focus:outline-none focus:ring-2 focus:ring-wa-green rounded"
            : "block focus:outline-none focus:ring-2 focus:ring-wa-green rounded overflow-hidden"
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={att.url}
          alt={att.filename}
          loading="lazy"
          decoding="async"
          className={
            isSticker
              ? "max-w-[160px] max-h-[160px] cursor-zoom-in"
              : "rounded-md max-w-full max-h-[360px] object-cover cursor-zoom-in"
          }
        />
      </button>
    );
  }

  if (att.type === "video") {
    return (
      <div className="relative">
        <video
          src={att.url}
          preload="none"
          className="rounded-md max-w-full max-h-[360px] cursor-zoom-in block"
          onClick={(e) => {
            e.preventDefault();
            onMediaClick?.(message.id);
          }}
        />
        <button
          type="button"
          onClick={() => onMediaClick?.(message.id)}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Play"
        >
          <span className="w-14 h-14 rounded-full bg-black/55 flex items-center justify-center">
            <i
              className="fa-solid fa-play text-white text-xl ml-1"
              aria-hidden
            />
          </span>
        </button>
      </div>
    );
  }

  if (att.type === "audio") {
    return (
      <audio
        src={att.url}
        controls
        preload="none"
        className="max-w-full"
      />
    );
  }

  return (
    <a
      href={att.url}
      download={att.filename}
      className="flex items-center gap-2 py-2 px-3 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-sm text-wa-text"
      onClick={(e) => e.stopPropagation()}
    >
      <i className="fa-solid fa-file-lines text-base shrink-0" aria-hidden />
      <span className="truncate">{att.filename}</span>
    </a>
  );
}

type Props = {
  message: Message;
  isOutgoing: boolean;
  showSender: boolean;
  isGroup: boolean;
  onMediaClick?: (messageId: string) => void;
};

function MessageBubble({
  message,
  isOutgoing,
  showSender,
  isGroup,
  onMediaClick,
}: Props) {
  const { t } = useI18n();

  if (message.isSystem) {
    return (
      <div className="flex justify-center my-2 px-4 msg-cv">
        <div className="bg-wa-system-bubble/90 text-wa-text/80 text-xs px-3 py-1.5 rounded-md shadow-sm max-w-md text-center">
          {message.text}
        </div>
      </div>
    );
  }

  const bubbleCls = isOutgoing
    ? "bg-wa-bubble-out text-wa-text"
    : "bg-wa-bubble text-wa-text";

  const senderColor =
    !isOutgoing && message.sender ? colorFromName(message.sender) : undefined;

  return (
    <div
      className={`msg-cv flex px-3 sm:px-6 ${isOutgoing ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative ${bubbleCls} rounded-lg shadow-sm px-2.5 py-1.5 max-w-[85%] sm:max-w-[65%] ${
          showSender ? (isOutgoing ? "bubble-out mt-2" : "bubble-in mt-2") : "mt-0.5"
        }`}
      >
        {showSender && isGroup && !isOutgoing && message.sender && (
          <div
            className="text-xs font-semibold mb-0.5"
            style={{ color: senderColor }}
          >
            {message.sender}
          </div>
        )}

        {message.attachment && (
          <div className="mb-1 -mx-1 -mt-1">
            <AttachmentView message={message} onMediaClick={onMediaClick} />
          </div>
        )}

        {message.isDeleted && (
          <div className="text-sm leading-snug whitespace-pre-wrap pr-12 italic text-wa-text-muted flex items-center gap-1.5">
            <i
              className="fa-solid fa-ban shrink-0 text-[13px]"
              aria-hidden
            />
            <span>{t("messageDeleted")}</span>
          </div>
        )}

        {message.text && !message.isDeleted && (
          <div className="text-sm leading-snug whitespace-pre-wrap pr-12">
            {renderText(message.text)}
          </div>
        )}

        <div className="float-right text-[10px] text-wa-text-muted ml-2 mt-0.5 select-none">
          {message.timestamp ? formatTime(message.timestamp) : ""}
          {isOutgoing && !message.isDeleted && (
            <span
              className="inline-flex items-center ml-1 text-sky-500 align-middle -mt-px"
              aria-hidden
            >
              <i className="fa-solid fa-check text-[11px] leading-none" />
              <i className="fa-solid fa-check text-[11px] leading-none -ml-[5px]" />
            </span>
          )}
        </div>
        <div className="clear-both" />
      </div>
    </div>
  );
}

export default memo(MessageBubble);
