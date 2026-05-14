"use client";

import { useEffect } from "react";
import ChatView from "@/components/ChatView";
import { useChat } from "@/components/ChatProvider";

export default function ChatsPage() {
  const { clearLoadingState } = useChat();

  // On mount only: drop any carried-over isLoading/progress state from the
  // upload flow on Home. `load()` intentionally keeps isLoading=true on
  // success so Home's Dropzone stays at 100% during navigation; we clear it
  // here once we've arrived. Must only run on mount — running on every
  // isLoading/progress change would kill the indicator for subsequent
  // in-chat uploads and leave the Upload button stuck disabled.
  useEffect(() => {
    clearLoadingState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ChatView />;
}
