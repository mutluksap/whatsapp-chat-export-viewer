"use client";

import { useEffect, useState } from "react";
import Dropzone, { type ImportMode } from "@/components/Dropzone";
import ChatView from "@/components/ChatView";
import {
  LoadChatError,
  loadFromTxt,
  loadFromZip,
  revokeBlobUrls,
} from "@/lib/loadChat";
import type { LoadedChat } from "@/lib/types";
import { useI18n } from "@/components/I18nProvider";

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

export default function Page() {
  const { t } = useI18n();
  const [chat, setChat] = useState<LoadedChat | null>(null);
  const [chatTitle, setChatTitle] = useState<string>("");
  const [meSender, setMeSender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (chat) revokeBlobUrls(chat.mediaBlobUrls);
    };
  }, [chat]);

  const handleFileSelected = async (file: File, mode: ImportMode) => {
    setError(null);
    setIsLoading(true);
    try {
      const lower = file.name.toLowerCase();
      if (mode === "text" && !lower.endsWith(".txt")) {
        throw new Error("errorWrongExtTxt");
      }
      if (mode === "zip" && !lower.endsWith(".zip")) {
        throw new Error("errorWrongExtZip");
      }

      const loaded =
        mode === "text" ? await loadFromTxt(file) : await loadFromZip(file);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setChat(null);
    setChatTitle("");
    setMeSender(null);
    setError(null);
  };

  if (!chat) {
    return (
      <Dropzone
        onFileSelected={handleFileSelected}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <ChatView
      chat={chat}
      chatTitle={chatTitle}
      meSender={meSender}
      onMeChange={setMeSender}
      onReset={handleReset}
    />
  );
}
