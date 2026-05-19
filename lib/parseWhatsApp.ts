import type { AttachmentType, Message, ParsedChat } from "./types";

// Bidi control marks WhatsApp sprinkles into export lines (LRM/RLM/etc.)
const BIDI_RE = /[‎‏‪-‮⁦-⁩]/g;

// iOS bracketed format: [DD.MM.YYYY HH:MM:SS] rest  or  [DD/MM/YY, H:MM:SS AM] rest
const IOS_RE =
  /^\[(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})[,\s]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*([AP]M|ÖÖ|ÖS)?\]\s*(.*)$/i;

// Android format: DD.MM.YYYY HH:MM - rest  or  DD/MM/YY, H:MM AM - rest
const ANDROID_RE =
  /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})[,\s]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*([AP]M|ÖÖ|ÖS)?\s*[-–—]\s*(.*)$/i;

// "(file attached)" variants in different languages
const ATTACHED_PARENS_RE =
  /\((?:file attached|dosya eklendi|dosya ekli|fichier joint|archivo adjunto|datei angehängt|allegato|документ прикреплен|ファイル添付)\)/i;

// Recognizable WhatsApp media filename pattern (used as a last resort)
const WA_FILENAME_RE =
  /\b((?:IMG|VID|AUD|PTT|STK|GIF|DOC|PHOTO|VIDEO|AUDIO)[-_][0-9A-Za-z._-]+\.[A-Za-z0-9]{2,5})\b/;

function parseDate(
  d: string,
  m: string,
  y: string,
  hh: string,
  mm: string,
  ss: string | undefined,
  ampm: string | undefined,
): Date | null {
  let year = parseInt(y, 10);
  const month = parseInt(m, 10) - 1;
  const day = parseInt(d, 10);
  let hours = parseInt(hh, 10);
  const minutes = parseInt(mm, 10);
  const seconds = ss ? parseInt(ss, 10) : 0;
  if (year < 100) year += 2000;
  if (ampm) {
    const upper = ampm.toUpperCase();
    const isPM = upper === "PM" || upper === "ÖS";
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  }
  const date = new Date(year, month, day, hours, minutes, seconds);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Localized verbs that follow the filename inside <...> on iOS exports
// (e.g. Turkish "<file.jpg eklendi>"). English uses "<attached: file.jpg>".
const IOS_VERBS_AFTER =
  "eklendi|attached|adjuntado|adjunto|anexado|joint|allegato|angehängt|添付|첨부됨|приложен(?:о|а)?";

function detectAttachment(
  text: string,
): { filename: string; cleanText: string } | null {
  // English iOS: <attached: filename>
  let m = text.match(/<\s*attached\s*:\s*([^>]+?)\s*>/i);
  if (m) {
    return {
      filename: m[1].trim(),
      cleanText: text.replace(m[0], "").trim(),
    };
  }

  // Turkish / other localized iOS: <filename eklendi>  (verb AFTER filename)
  m = text.match(
    new RegExp(
      `<\\s*([^<>]+?\\.[A-Za-z0-9]{2,5})\\s+(?:${IOS_VERBS_AFTER})\\s*>`,
      "i",
    ),
  );
  if (m) {
    return {
      filename: m[1].trim(),
      cleanText: text.replace(m[0], "").trim(),
    };
  }

  // iOS older variant: "filename <attached>"
  m = text.match(/^([^\s<>][^<>]*?)\s*<\s*attached\s*>\s*$/i);
  if (m) {
    return {
      filename: m[1].trim(),
      cleanText: "",
    };
  }

  // Android: filename (file attached) / (dosya eklendi) / ...
  m = text.match(
    new RegExp(
      `([^\\s()<>][^()<>]*?\\.[A-Za-z0-9]{2,5})\\s*${ATTACHED_PARENS_RE.source}`,
      "i",
    ),
  );
  if (m) {
    return {
      filename: m[1].trim(),
      cleanText: text.replace(m[0], "").trim(),
    };
  }

  // Whole-line is just a WhatsApp media filename (rare but seen)
  const trimmed = text.trim();
  if (WA_FILENAME_RE.test(trimmed)) {
    const fm = trimmed.match(WA_FILENAME_RE);
    if (fm && fm[1] === trimmed) {
      return { filename: fm[1], cleanText: "" };
    }
  }

  return null;
}

export function classifyAttachment(filename: string): AttachmentType {
  const lower = filename.toLowerCase();
  const ext = lower.split(".").pop() || "";
  if (/^stk[-_]/.test(lower) || lower.includes("sticker")) return "sticker";
  if (["jpg", "jpeg", "png", "gif", "heic", "bmp"].includes(ext)) return "image";
  if (ext === "webp") return "sticker";
  if (["mp4", "mov", "3gp", "mkv", "webm", "avi"].includes(ext)) return "video";
  if (["opus", "mp3", "m4a", "aac", "ogg", "oga", "wav"].includes(ext))
    return "audio";
  return "document";
}

export function isMediaOmittedLine(text: string): boolean {
  const t = text.trim();
  return (
    t === "<Media omitted>" ||
    t === "<Medya dahil edilmedi>" ||
    t === "<Medya çıkarıldı>" ||
    t === "<médias omis>" ||
    t === "<multimedia omitido>" ||
    /^(?:image|video|audio|GIF|sticker|document)\s+omitted$/i.test(t) ||
    // WhatsApp iOS Turkish: per-type placeholder, sometimes wrapped in <...>
    /^<?\s*(?:görüntü|video|ses|gif|çıkartma|sticker|belge|doküman)\s+dahil\s+edilmedi\s*>?$/i.test(
      t,
    )
  );
}

// WhatsApp shows a fixed sentinel string where a message was deleted. Strings
// vary by locale and by whether it was you or the other party. Match either form.
const DELETED_PATTERNS: RegExp[] = [
  /^this message was deleted\.?$/i,
  /^you deleted this message\.?$/i,
  /^bu mesaj silindi\.?$/i,
  /^bu mesajı sildiniz\.?$/i,
  /^se eliminó este mensaje\.?$/i,
  /^eliminaste este mensaje\.?$/i,
  /^ce message a été supprimé\.?$/i,
  /^vous avez supprimé ce message\.?$/i,
  /^diese nachricht wurde gelöscht\.?$/i,
  /^du hast diese nachricht gelöscht\.?$/i,
  /^questo messaggio è stato eliminato\.?$/i,
  /^hai eliminato questo messaggio\.?$/i,
  /^esta mensagem foi apagada\.?$/i,
  /^você apagou esta mensagem\.?$/i,
  /^сообщение удалено\.?$/i,
  /^вы удалили это сообщение\.?$/i,
  /^このメッセージは削除されました。?$/,
  /^このメッセージを削除しました。?$/,
];

export function isDeletedMessageText(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return DELETED_PATTERNS.some((re) => re.test(t));
}

export function parseWhatsAppText(content: string): ParsedChat {
  const text = content.replace(/^﻿/, "").replace(BIDI_RE, "");
  const lines = text.split(/\r?\n/);

  const messages: Message[] = [];
  const participants: string[] = [];
  const seen = new Set<string>();
  let idCounter = 0;

  const pushParticipant = (name: string) => {
    if (!seen.has(name)) {
      seen.add(name);
      participants.push(name);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line) continue;

    let match = line.match(IOS_RE);
    let rest = "";
    let date: Date | null = null;

    if (match) {
      const [, d, mo, y, hh, mm, ss, ampm, r] = match;
      date = parseDate(d, mo, y, hh, mm, ss, ampm);
      rest = r;
    } else {
      match = line.match(ANDROID_RE);
      if (match) {
        const [, d, mo, y, hh, mm, ss, ampm, r] = match;
        date = parseDate(d, mo, y, hh, mm, ss, ampm);
        rest = r;
      } else {
        if (messages.length > 0) {
          const last = messages[messages.length - 1];
          last.text = last.text ? `${last.text}\n${line}` : line;
        }
        continue;
      }
    }

    let sender: string | null = null;
    let messageText = rest;

    const colonIdx = rest.indexOf(": ");
    if (colonIdx > 0 && colonIdx < 80) {
      const senderCandidate = rest.slice(0, colonIdx).trim();
      if (senderCandidate && !senderCandidate.includes("\n")) {
        sender = senderCandidate;
        messageText = rest.slice(colonIdx + 2);
      }
    }

    if (sender) pushParticipant(sender);

    let attachment;
    if (sender) {
      const att = detectAttachment(messageText);
      if (att) {
        attachment = {
          filename: att.filename,
          type: classifyAttachment(att.filename),
        };
        messageText = att.cleanText;
      } else if (isMediaOmittedLine(messageText)) {
        attachment = {
          filename: "",
          type: "document" as AttachmentType,
        };
        messageText = "";
      }
    }

    const isDeleted =
      !!sender && !attachment && isDeletedMessageText(messageText);

    messages.push({
      id: `msg-${idCounter++}`,
      timestamp: date,
      sender,
      text: messageText,
      attachment,
      isSystem: !sender,
      isDeleted,
    });
  }

  return { messages, participants };
}
