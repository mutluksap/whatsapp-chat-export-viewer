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

export type LoadedChat = ParsedChat & {
  mediaBlobUrls: string[];
  hasMedia: boolean;
};
