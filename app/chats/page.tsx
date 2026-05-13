"use client";

import Dropzone, { type ImportMode } from "@/components/Dropzone";
import ChatView from "@/components/ChatView";
import { useChat } from "@/components/ChatProvider";

export default function ChatsPage() {
  const { chat, chatTitle, meSender, isLoading, error, load, reset, setMeSender } =
    useChat();

  const handleFile = async (file: File, mode: ImportMode) => {
    await load(file, mode);
  };

  if (!chat) {
    return (
      <Dropzone
        onFileSelected={handleFile}
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
      onReset={reset}
    />
  );
}
