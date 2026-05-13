import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/ThemeProvider";
import { ChatProvider } from "@/components/ChatProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "WA Viewer — WhatsApp Chat Export Viewer",
    template: "WA Viewer — %s",
  },
  description:
    "Open exported WhatsApp .txt or .zip chats in a familiar WhatsApp Web–style interface. Free, private, browser-based — your files never leave your device.",
  applicationName: "WA Viewer",
  keywords: [
    "WhatsApp chat viewer",
    "WhatsApp export viewer",
    "view WhatsApp chat online",
    "WhatsApp txt viewer",
    "WhatsApp zip viewer",
    "chat history viewer",
  ],
  authors: [{ name: "WA Viewer" }],
  openGraph: {
    type: "website",
    siteName: "WA Viewer",
    title: "WA Viewer — WhatsApp Chat Export Viewer",
    description:
      "Open exported WhatsApp chats in a WhatsApp Web–style viewer. Private and browser-based.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WA Viewer — WhatsApp Chat Export Viewer",
    description:
      "Open exported WhatsApp chats in a WhatsApp Web–style viewer. Private and browser-based.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <I18nProvider>
            <ChatProvider>
              <div className="min-h-screen flex flex-col bg-wa-panel">
                <SiteHeader />
                <main className="flex-1 flex flex-col">{children}</main>
                <SiteFooter />
              </div>
            </ChatProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
