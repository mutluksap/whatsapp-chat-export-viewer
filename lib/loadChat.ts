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

function readImageDims(url: string): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export type LoadProgress = { done: number; total: number };
export type LoadProgressCallback = (p: LoadProgress) => void;

export type ResolvedMedia = {
  url: string;
  mimeType: string;
  width?: number;
  height?: number;
};

type CacheEntry = ResolvedMedia & { refCount: number };

/**
 * Lazily decompresses media entries from a zip on demand. Each call to
 * `resolve` returns a blob URL (creating one if needed) and bumps a ref
 * count; the URL is revoked once `release` is called the same number of
 * times. This keeps peak memory bounded to roughly the media currently
 * on screen — critical for mobile Safari, which kills tabs that exceed
 * ~500 MB of blob memory.
 */
export class MediaResolver {
  private reader: ZipReader<unknown>;
  private byName: Map<string, FileEntry>;
  private byLower: Map<string, FileEntry>;
  private cache = new Map<string, CacheEntry>();
  private pending = new Map<string, Promise<ResolvedMedia | null>>();
  private closed = false;

  constructor(
    reader: ZipReader<unknown>,
    byName: Map<string, FileEntry>,
    byLower: Map<string, FileEntry>,
  ) {
    this.reader = reader;
    this.byName = byName;
    this.byLower = byLower;
  }

  private findEntry(
    rawName: string,
  ): { key: string; entry: FileEntry } | null {
    const name = rawName.trim();
    let entry = this.byName.get(name);
    if (entry) return { key: name, entry };
    const lower = name.toLowerCase();
    entry = this.byLower.get(lower);
    if (entry) return { key: lower, entry };
    const base = name.split(/[\\/]/).pop();
    if (base && base !== name) {
      entry = this.byName.get(base);
      if (entry) return { key: base, entry };
      entry = this.byLower.get(base.toLowerCase());
      if (entry) return { key: base.toLowerCase(), entry };
    }
    return null;
  }

  hasEntry(rawName: string): boolean {
    return this.findEntry(rawName) !== null;
  }

  /** Filename → mime type, without touching the zip. */
  mimeFor(rawName: string): string {
    return mimeFor(rawName);
  }

  async resolve(rawName: string): Promise<ResolvedMedia | null> {
    if (this.closed) return null;
    const found = this.findEntry(rawName);
    if (!found) return null;
    const cacheKey = found.key;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.refCount++;
      return {
        url: cached.url,
        mimeType: cached.mimeType,
        width: cached.width,
        height: cached.height,
      };
    }

    // Coalesce concurrent resolves of the same entry so we only
    // decompress once even if MessageBubble + Lightbox both ask.
    const inflight = this.pending.get(cacheKey);
    if (inflight) {
      const r = await inflight;
      if (r) {
        const c = this.cache.get(cacheKey);
        if (c) c.refCount++;
      }
      return r;
    }

    const promise = (async (): Promise<ResolvedMedia | null> => {
      const filename =
        found.entry.filename.split("/").pop() || found.entry.filename;
      const mime = mimeFor(filename);
      const blob = await found.entry.getData(new BlobWriter(mime));
      if (this.closed) return null;
      const url = URL.createObjectURL(blob);
      let width: number | undefined;
      let height: number | undefined;
      if (mime.startsWith("image/")) {
        const dims = await readImageDims(url);
        if (dims) {
          width = dims.w;
          height = dims.h;
        }
      }
      if (this.closed) {
        URL.revokeObjectURL(url);
        return null;
      }
      const entry: CacheEntry = {
        url,
        mimeType: mime,
        width,
        height,
        refCount: 1,
      };
      this.cache.set(cacheKey, entry);
      return { url, mimeType: mime, width, height };
    })();

    this.pending.set(cacheKey, promise);
    try {
      return await promise;
    } finally {
      this.pending.delete(cacheKey);
    }
  }

  release(rawName: string): void {
    if (this.closed) return;
    const found = this.findEntry(rawName);
    if (!found) return;
    const cacheKey = found.key;
    const entry = this.cache.get(cacheKey);
    if (!entry) return;
    entry.refCount--;
    if (entry.refCount <= 0) {
      URL.revokeObjectURL(entry.url);
      this.cache.delete(cacheKey);
    }
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    for (const entry of this.cache.values()) {
      URL.revokeObjectURL(entry.url);
    }
    this.cache.clear();
    this.pending.clear();
    try {
      await this.reader.close();
    } catch {
      // Reader may already be closed if the tab was navigating away.
    }
  }
}

export async function loadFromTxt(file: File): Promise<LoadedChat> {
  const content = await file.text();
  const parsed = parseWhatsAppText(content);
  return { ...parsed, mediaResolver: null, hasMedia: false };
}

export async function loadFromZip(
  file: File,
  _onProgress?: LoadProgressCallback,
): Promise<LoadedChat> {
  // The whole zip is streamed: only the central directory is read up
  // front, and individual entries are decompressed lazily by MediaResolver
  // as the UI requests them. That's what lets ~2 GB zips load on mobile.
  const reader = new ZipReader(new BlobReader(file));

  let resolver: MediaResolver | null = null;
  let mediaCount = 0;
  try {
    const entries = await reader.getEntries();
    const fileEntries = entries.filter(
      (e): e is FileEntry => !e.directory,
    );

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

    // Index media entries by basename (case-sensitive + lowercase) so the
    // resolver can look up attachments however the chat text names them.
    const byName = new Map<string, FileEntry>();
    const byLower = new Map<string, FileEntry>();
    for (const entry of fileEntries) {
      if (entry === chatEntry) continue;
      const filename = entry.filename.split("/").pop() || entry.filename;
      if (!byName.has(filename)) byName.set(filename, entry);
      const lower = filename.toLowerCase();
      if (!byLower.has(lower)) byLower.set(lower, entry);
      mediaCount++;
    }

    if (mediaCount > 0) {
      resolver = new MediaResolver(reader, byName, byLower);
    }

    // Pre-populate mimeType on attachments where we have a matching entry,
    // so audio/video elements can render their controls before resolve.
    if (resolver) {
      for (const msg of parsed.messages) {
        if (
          msg.attachment?.filename &&
          resolver.hasEntry(msg.attachment.filename)
        ) {
          msg.attachment.mimeType = resolver.mimeFor(msg.attachment.filename);
        }
      }
    }

    if (typeof window !== "undefined") {
      const detected = parsed.messages.filter(
        (m) => m.attachment?.filename,
      ).length;
      const r = resolver;
      const matched = r
        ? parsed.messages.filter(
            (m) =>
              !!m.attachment?.filename && r.hasEntry(m.attachment.filename),
          ).length
        : 0;
      console.log(
        `[WhatsApp Preview] ${mediaCount} media file(s) in zip, ${detected} attachment marker(s) in chat, ${matched} matched (lazy).`,
      );
    }

    return {
      ...parsed,
      mediaResolver: resolver,
      hasMedia: mediaCount > 0,
    };
  } catch (err) {
    // If we never built a resolver, close the reader now — otherwise the
    // resolver owns it and will close on its own close().
    if (!resolver) {
      try {
        await reader.close();
      } catch {
        /* ignore */
      }
    }
    throw err;
  }
}
