"use client";

import { useEffect } from "react";
import Dropzone, { type ImportMode } from "@/components/Dropzone";
import ChatView from "@/components/ChatView";
import { useChat } from "@/components/ChatProvider";

export default function ChatsPage() {
  const {
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
  } = useChat();

  // When we land on /chats with a chat already loaded, drop the carried-over
  // isLoading/progress state from the upload flow on Home. Without this the
  // state would linger (it's intentionally not cleared on success so the
  // Dropzone on Home stays at 100% during navigation instead of flashing
  // back to its default look).
  useEffect(() => {
    if (chat && (isLoading || progress)) {
      clearLoadingState();
    }
  }, [chat, isLoading, progress, clearLoadingState]);

  const handleFile = async (file: File, mode: ImportMode) => {
    await load(file, mode);
  };

  if (!chat) {
    return (
      <Dropzone
        onFileSelected={handleFile}
        isLoading={isLoading}
        progress={progress}
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
      onReset={reset}
    />
  );
}
