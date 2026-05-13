import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chats",
  description:
    "View your imported WhatsApp chat in a familiar WhatsApp Web–style interface. Search, filter and browse messages and media — all locally in your browser.",
  openGraph: {
    title: "WA Viewer — Chats",
    description:
      "Open and browse your WhatsApp chat exports. Private, browser-only.",
  },
};

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
