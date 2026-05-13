import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with WA Viewer for questions, feedback, bug reports, or contributions.",
  openGraph: {
    title: "WA Viewer — Contact",
    description: "Reach out for questions, feedback or contributions.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
