"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LoadChatError,
  type LoadProgress,
  loadFromTxt,
  loadFromZip,
  revokeBlobUrls,
} from "@/lib/loadChat";
import type { LoadedChat } from "@/lib/types";
import { useI18n } from "./I18nProvider";

export type ImportMode = "text" | "zip";

export type LoadedChatRecord = LoadedChat & {
  id: string;
  title: string;
  meSender: string | null;
};

type Ctx = {
  /** All currently loaded chats, in import order. */
  chats: LoadedChatRecord[];
  /** Id of the chat currently selected to display in the chat panel. */
  activeChatId: string | null;
  /** Resolved active chat (lookup of activeChatId in chats). */
  activeChat: LoadedChatRecord | null;
  isLoading: boolean;
  progress: LoadProgress | null;
  error: string | null;
  /** Load a new chat from a file. Appends to `chats` and selects it. */
  load: (file: File, mode: ImportMode) => Promise<boolean>;
  /** Make the chat with the given id the active one. */
  selectChat: (id: string) => void;
  /** Delete the chat with the given id. If it was active, falls back to another (or null). */
  deleteChat: (id: string) => void;
  /** Update the "me" sender for the currently active chat. */
  setMeSender: (sender: string | null) => void;
  /** Clear all chats. */
  reset: () => void;
  clearLoadingState: () => void;
};

const ChatContext = createContext<Ctx | null>(null);

function deriveTitle(filename: string, fallback: string): string {
  const base = filename.replace(/\.(zip|txt)$/i, "");
  const m =
    base.match(/(?:WhatsApp\s+Chat\s+with\s+)(.+)/i) ||
    base.match(/(?:WhatsApp\s+Sohbeti\s*[-:]\s*)(.+)/i);
  if (m && m[1]) return m[1].trim();
  if (/^_chat$/i.test(base)) return fallback;
  return base;
}

function pickDefaultMe(
  participants: string[],
  messageCounts: Map<string, number>,
): string | null {
  if (participants.length === 0) return null;
  if (participants.length === 1) return null;
  let best = participants[0];
  let bestN = messageCounts.get(best) ?? 0;
  for (const p of participants) {
    const n = messageCounts.get(p) ?? 0;
    if (n > bestN) {
      best = p;
      bestN = n;
    }
  }
  return best;
}

function makeChatId(): string {
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [chats, setChats] = useState<LoadedChatRecord[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<LoadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) ?? null,
    [chats, activeChatId],
  );

  // Revoke media URLs for all chats on unmount.
  useEffect(() => {
    return () => {
      for (const c of chats) {
        revokeBlobUrls(c.mediaBlobUrls);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(
    async (file: File, mode: ImportMode): Promise<boolean> => {
      setError(null);
      setProgress(null);
      setIsLoading(true);
      let success = false;
      try {
        const lower = file.name.toLowerCase();
        if (mode === "text" && !lower.endsWith(".txt")) {
          throw new Error("errorWrongExtTxt");
        }
        if (mode === "zip" && !lower.endsWith(".zip")) {
          throw new Error("errorWrongExtZip");
        }

        const loaded =
          mode === "text"
            ? await loadFromTxt(file)
            : await loadFromZip(file, (p) => setProgress(p));

        if (loaded.messages.length === 0) {
          throw new Error("errorNoMessages");
        }

        const counts = new Map<string, number>();
        for (const m of loaded.messages) {
          if (m.sender) counts.set(m.sender, (counts.get(m.sender) ?? 0) + 1);
        }

        const record: LoadedChatRecord = {
          ...loaded,
          id: makeChatId(),
          title: deriveTitle(file.name, t("defaultChatTitle")),
          meSender: pickDefaultMe(loaded.participants, counts),
        };

        setChats((prev) => [...prev, record]);
        setActiveChatId(record.id);
        success = true;
        return true;
      } catch (err) {
        if (err instanceof LoadChatError) {
          setError(
            err.code === "noTxtInZip"
              ? t("errorNoTxtInZip")
              : t("errorCantReadChat"),
          );
        } else if (err instanceof Error) {
          const msg = err.message;
          if (msg === "errorWrongExtTxt") setError(t("errorWrongExtTxt"));
          else if (msg === "errorWrongExtZip") setError(t("errorWrongExtZip"));
          else if (msg === "errorNoMessages") setError(t("errorNoMessages"));
          else setError(t("errorGeneric"));
        } else {
          setError(t("errorGeneric"));
        }
        return false;
      } finally {
        if (!success) {
          setIsLoading(false);
          setProgress(null);
        }
        // On success, keep isLoading=true and progress at 100% until the
        // chat page mounts and calls clearLoadingState() — prevents flashing
        // back to the default Dropzone state during navigation.
      }
    },
    [t],
  );

  const selectChat = useCallback((id: string) => {
    setActiveChatId(id);
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => {
      const target = prev.find((c) => c.id === id);
      if (target) revokeBlobUrls(target.mediaBlobUrls);
      const next = prev.filter((c) => c.id !== id);
      // If the deleted chat was active, switch active to the next available.
      setActiveChatId((curId) => {
        if (curId !== id) return curId;
        return next[0]?.id ?? null;
      });
      return next;
    });
  }, []);

  const setMeSender = useCallback(
    (sender: string | null) => {
      if (!activeChatId) return;
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId ? { ...c, meSender: sender } : c,
        ),
      );
    },
    [activeChatId],
  );

  const reset = useCallback(() => {
    setChats((prev) => {
      for (const c of prev) revokeBlobUrls(c.mediaBlobUrls);
      return [];
    });
    setActiveChatId(null);
    setError(null);
    setIsLoading(false);
    setProgress(null);
  }, []);

  const clearLoadingState = useCallback(() => {
    setIsLoading(false);
    setProgress(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        activeChat,
        isLoading,
        progress,
        error,
        load,
        selectChat,
        deleteChat,
        setMeSender,
        reset,
        clearLoadingState,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): Ctx {
  const c = useContext(ChatContext);
  if (!c) throw new Error("useChat must be used inside <ChatProvider>");
  return c;
}
