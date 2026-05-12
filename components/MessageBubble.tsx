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
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 shrink-0"
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
          preload="metadata"
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
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-white ml-1"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
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
        preload="metadata"
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
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.25 11.25-2.625 2.625m0 0L8.25 13.5m2.625 2.625V9.75M6.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25V9.75a9 9 0 0 0-9-9H6.75A2.25 2.25 0 0 0 4.5 3v16.5a2.25 2.25 0 0 0 2.25 2.25Z"
        />
      </svg>
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

export default function MessageBubble({
  message,
  isOutgoing,
  showSender,
  isGroup,
  onMediaClick,
}: Props) {
  if (message.isSystem) {
    return (
      <div className="flex justify-center my-2 px-4">
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
      className={`flex px-3 sm:px-6 ${isOutgoing ? "justify-end" : "justify-start"}`}
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

        {message.text && (
          <div className="text-sm leading-snug whitespace-pre-wrap pr-12">
            {renderText(message.text)}
          </div>
        )}

        <div className="float-right text-[10px] text-wa-text-muted ml-2 mt-0.5 select-none">
          {message.timestamp ? formatTime(message.timestamp) : ""}
          {isOutgoing && (
            <svg
              viewBox="0 0 16 11"
              className="inline-block ml-1 -mb-px w-4 h-3 text-sky-500"
              fill="currentColor"
              aria-hidden
            >
              <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.148.51.51 0 0 0-.355.148L.36 6.864a.504.504 0 0 0 0 .713l3.643 3.464a.49.49 0 0 0 .343.13.435.435 0 0 0 .333-.148L15.62 1.768a.51.51 0 0 0 .15-.36.45.45 0 0 0-.149-.351L14.516.045a.45.45 0 0 0-.345-.16.502.502 0 0 0-.367.165L4.456 8.815 11.07.653Z" />
            </svg>
          )}
        </div>
        <div className="clear-both" />
      </div>
    </div>
  );
}
