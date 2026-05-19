export type AttachmentType =
  | "image"
  | "video"
  | "audio"
  | "sticker"
  | "document";

export type Attachment = {
  filename: string;
  type: AttachmentType;
  url?: string;
  mimeType?: string;
  /** Natural pixel dimensions, read upfront for images so the layout can
   *  reserve the right amount of space before bytes load (no scroll jump). */
  width?: number;
  height?: number;
};

export type Message = {
  id: string;
  timestamp: Date | null;
  sender: string | null;
  text: string;
  attachment?: Attachment;
  isSystem: boolean;
  isDeleted?: boolean;
};

export type ParsedChat = {
  messages: Message[];
  participants: string[];
};

// Forward-declared to break the cycle with loadChat.ts; the actual
// MediaResolver class lives there.
export interface MediaResolverLike {
  resolve(rawName: string): Promise<{
    url: string;
    mimeType: string;
    width?: number;
    height?: number;
  } | null>;
  release(rawName: string): void;
  hasEntry(rawName: string): boolean;
  close(): Promise<void>;
}

export type LoadedChat = ParsedChat & {
  /** Null when the chat was loaded from a bare .txt file (no media). */
  mediaResolver: MediaResolverLike | null;
  hasMedia: boolean;
};
