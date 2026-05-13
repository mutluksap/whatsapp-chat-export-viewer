"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

type Ctx = {
  chat: LoadedChat | null;
  chatTitle: string;
  meSender: string | null;
  isLoading: boolean;
  progress: LoadProgress | null;
  error: string | null;
  load: (file: File, mode: ImportMode) => Promise<boolean>;
  reset: () => void;
  setMeSender: (s: string | null) => void;
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

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [chat, setChat] = useState<LoadedChat | null>(null);
  const [chatTitle, setChatTitle] = useState<string>("");
  const [meSender, setMeSender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<LoadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (chat) revokeBlobUrls(chat.mediaBlobUrls);
    };
  }, [chat]);

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

        setChat(loaded);
        setChatTitle(deriveTitle(file.name, t("defaultChatTitle")));
        setMeSender(pickDefaultMe(loaded.participants, counts));
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
        // chat page mounts and calls clearLoadingState(). This prevents the
        // Dropzone from briefly flashing back to its default state between
        // load completion and navigation.
      }
    },
    [t],
  );

  const reset = useCallback(() => {
    setChat((prev) => {
      if (prev) revokeBlobUrls(prev.mediaBlobUrls);
      return null;
    });
    setChatTitle("");
    setMeSender(null);
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
        chat,
        chatTitle,
        meSender,
        isLoading,
        progress,
        error,
        load,
        reset,
        setMeSender,
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
