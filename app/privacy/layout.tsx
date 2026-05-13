import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Your privacy is our priority. WA Viewer processes your WhatsApp chat exports entirely in your browser — no uploads, no tracking, no cookies.",
  openGraph: {
    title: "WA Viewer — Privacy",
    description:
      "Files stay in your browser. No uploads, no tracking.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
