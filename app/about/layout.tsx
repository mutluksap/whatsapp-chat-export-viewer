import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Open-source WhatsApp Chat Viewer that turns exported .txt and .zip chats into a familiar WhatsApp Web–like interface. Built privacy-first.",
  openGraph: {
    title: "WA Viewer — About",
    description:
      "Open-source WhatsApp chat viewer. Browser-based, private, free.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
