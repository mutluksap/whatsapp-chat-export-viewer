import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/ThemeProvider";
import { ChatProvider } from "@/components/ChatProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "WhatsApp Chat Export Viewer",
  description:
    "View WhatsApp chat exports (.txt or .zip) in a WhatsApp Web–style interface.",
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
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <I18nProvider>
            <ChatProvider>
              <div className="min-h-screen flex flex-col bg-wa-bg">
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
