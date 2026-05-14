"use client";

import { useEffect } from "react";
import ChatView from "@/components/ChatView";
import { useChat } from "@/components/ChatProvider";

export default function ChatsPage() {
  const { activeChat, isLoading, progress, clearLoadingState } = useChat();

  // When we land on /chats with a chat already loaded, drop the carried-over
  // isLoading/progress state from the upload flow on Home. Without this the
  // state would linger (it's intentionally not cleared on success so the
  // Dropzone on Home stays at 100% during navigation instead of flashing
  // back to its default look).
  useEffect(() => {
    if (activeChat && (isLoading || progress)) {
      clearLoadingState();
    }
  }, [activeChat, isLoading, progress, clearLoadingState]);

  return <ChatView />;
}
