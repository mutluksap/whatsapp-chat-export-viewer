import JSZip from "jszip";
import { parseWhatsAppText } from "./parseWhatsApp";
import type { LoadedChat } from "./types";

export class LoadChatError extends Error {
  code: "noTxtInZip" | "cantReadChat";
  constructor(code: "noTxtInZip" | "cantReadChat") {
    super(code);
    this.code = code;
  }
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  bmp: "image/bmp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  "3gp": "video/3gpp",
  mkv: "video/x-matroska",
  webm: "video/webm",
  opus: "audio/ogg",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  wav: "audio/wav",
  pdf: "application/pdf",
};

function mimeFor(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop() || "";
  return MIME_BY_EXT[ext] || "application/octet-stream";
}

export type LoadProgress = { done: number; total: number };
export type LoadProgressCallback = (p: LoadProgress) => void;

export async function loadFromTxt(file: File): Promise<LoadedChat> {
  const content = await file.text();
  const parsed = parseWhatsAppText(content);
  return { ...parsed, mediaBlobUrls: [], hasMedia: false };
}

export async function loadFromZip(
  file: File,
  onProgress?: LoadProgressCallback,
): Promise<LoadedChat> {
  const zip = await JSZip.loadAsync(file);

  // Find the chat .txt file
  let chatPath: string | null = null;
  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    const lower = relativePath.toLowerCase();
    if (!lower.endsWith(".txt")) return;
    // Prefer _chat.txt (iOS) or files containing "chat"/"sohbet"
    if (
      !chatPath ||
      lower.endsWith("_chat.txt") ||
      lower.includes("chat") ||
      lower.includes("sohbet")
    ) {
      chatPath = relativePath;
    }
  });

  if (!chatPath) {
    throw new LoadChatError("noTxtInZip");
  }

  const chatEntry = zip.file(chatPath);
  if (!chatEntry) {
    throw new LoadChatError("cantReadChat");
  }
  const content = await chatEntry.async("string");
  const parsed = parseWhatsAppText(content);

  // Map filename → { url, w, h } for all media entries (case-insensitive lookup).
  // Dimensions are pre-read for images so MessageBubble can render <img> with
  // explicit width/height attributes — that reserves space before the bytes
  // decode and keeps the virtualized list from shifting during scroll-up.
  type MediaInfo = { url: string; width?: number; height?: number };
  const filenameToInfo = new Map<string, MediaInfo>();
  const lowerToInfo = new Map<string, MediaInfo>();
  const blobUrls: string[] = [];

  const readImageDims = (url: string): Promise<{ w: number; h: number } | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = url;
    });

  const mediaEntries: { filename: string; entry: JSZip.JSZipObject }[] = [];
  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    if (relativePath === chatPath) return;
    const filename = relativePath.split("/").pop() || relativePath;
    mediaEntries.push({ filename, entry });
  });

  onProgress?.({ done: 0, total: mediaEntries.length });
  let completed = 0;
  await Promise.all(
    mediaEntries.map(async ({ filename, entry }) => {
      const blob = await entry.async("blob");
      const mime = mimeFor(filename);
      const typedBlob = new Blob([blob], { type: mime });
      const url = URL.createObjectURL(typedBlob);
      blobUrls.push(url);
      let info: MediaInfo = { url };
      if (mime.startsWith("image/")) {
        const dims = await readImageDims(url);
        if (dims) info = { url, width: dims.w, height: dims.h };
      }
      filenameToInfo.set(filename, info);
      lowerToInfo.set(filename.toLowerCase(), info);
      completed++;
      onProgress?.({ done: completed, total: mediaEntries.length });
    }),
  );

  const lookup = (rawName: string): MediaInfo | undefined => {
    const name = rawName.trim();
    let info = filenameToInfo.get(name);
    if (info) return info;
    info = lowerToInfo.get(name.toLowerCase());
    if (info) return info;
    // basename fallback in case the message text contains a path
    const base = name.split(/[\\/]/).pop()!;
    if (base !== name) {
      info = filenameToInfo.get(base) || lowerToInfo.get(base.toLowerCase());
      if (info) return info;
    }
    return undefined;
  };

  let matched = 0;
  let detected = 0;
  const unmatched: string[] = [];
  for (const msg of parsed.messages) {
    if (msg.attachment && msg.attachment.filename) {
      detected++;
      const info = lookup(msg.attachment.filename);
      if (info) {
        msg.attachment.url = info.url;
        msg.attachment.mimeType = mimeFor(msg.attachment.filename);
        if (info.width) msg.attachment.width = info.width;
        if (info.height) msg.attachment.height = info.height;
        matched++;
      } else {
        unmatched.push(msg.attachment.filename);
      }
    }
  }

  if (typeof window !== "undefined") {
    console.log(
      `[WhatsApp Preview] ${mediaEntries.length} media file(s) in zip, ${detected} attachment marker(s) in chat, ${matched} matched.`,
    );
    if (unmatched.length > 0) {
      console.warn(
        "[WhatsApp Preview] Unmatched attachments:",
        unmatched.slice(0, 10),
      );
      console.warn(
        "[WhatsApp Preview] First media files in zip:",
        mediaEntries.slice(0, 10).map((e) => e.filename),
      );
    }
  }

  return {
    ...parsed,
    mediaBlobUrls: blobUrls,
    hasMedia: mediaEntries.length > 0,
  };
}

export function revokeBlobUrls(urls: string[]) {
  for (const url of urls) URL.revokeObjectURL(url);
}
