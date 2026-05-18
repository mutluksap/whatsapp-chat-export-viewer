import {
  BlobReader,
  BlobWriter,
  TextWriter,
  ZipReader,
  type FileEntry,
} from "@zip.js/zip.js";
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
  // zip.js streams the archive: only the central directory is read up-front,
  // and each entry is decompressed on demand. That's what lets multi-GB zips
  // work without buffering the whole file into memory.
  const reader = new ZipReader(new BlobReader(file));

  try {
    const entries = await reader.getEntries();

    const fileEntries = entries.filter(
      (e): e is FileEntry => !e.directory,
    );

    // Find the chat .txt file — prefer _chat.txt (iOS) or names with "chat"/"sohbet".
    let chatEntry: FileEntry | null = null;
    for (const entry of fileEntries) {
      const lower = entry.filename.toLowerCase();
      if (!lower.endsWith(".txt")) continue;
      if (
        !chatEntry ||
        lower.endsWith("_chat.txt") ||
        lower.includes("chat") ||
        lower.includes("sohbet")
      ) {
        chatEntry = entry;
      }
    }

    if (!chatEntry) {
      throw new LoadChatError("noTxtInZip");
    }

    const content = await chatEntry.getData(new TextWriter());
    const parsed = parseWhatsAppText(content);

    // Map filename → { url, w, h } for all media entries (case-insensitive lookup).
    // Dimensions are pre-read for images so MessageBubble can render <img> with
    // explicit width/height attributes — that reserves space before the bytes
    // decode and keeps the virtualized list from shifting during scroll-up.
    type MediaInfo = { url: string; width?: number; height?: number };
    const filenameToInfo = new Map<string, MediaInfo>();
    const lowerToInfo = new Map<string, MediaInfo>();
    const blobUrls: string[] = [];

    const readImageDims = (
      url: string,
    ): Promise<{ w: number; h: number } | null> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = url;
      });

    const mediaEntries: { filename: string; entry: FileEntry }[] = [];
    for (const entry of fileEntries) {
      if (entry === chatEntry) continue;
      const filename = entry.filename.split("/").pop() || entry.filename;
      mediaEntries.push({ filename, entry });
    }

    onProgress?.({ done: 0, total: mediaEntries.length });
    let completed = 0;

    // Cap parallelism — zip.js can decompress entries concurrently in worker
    // threads, but each one still allocates the full uncompressed bytes.
    // Without a cap a media-heavy zip would peak at total uncompressed size.
    const CONCURRENCY = 4;
    let cursor = 0;
    const worker = async () => {
      while (true) {
        const idx = cursor++;
        if (idx >= mediaEntries.length) return;
        const { filename, entry } = mediaEntries[idx];
        const mime = mimeFor(filename);
        const blob = await entry.getData(new BlobWriter(mime));
        const url = URL.createObjectURL(blob);
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
      }
    };
    await Promise.all(
      Array.from(
        { length: Math.min(CONCURRENCY, mediaEntries.length) },
        worker,
      ),
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
  } finally {
    await reader.close();
  }
}

export function revokeBlobUrls(urls: string[]) {
  for (const url of urls) URL.revokeObjectURL(url);
}
