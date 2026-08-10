import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/components/auth/AuthProvider";
import { AuthModal } from "@/src/components/auth/AuthModal";
import { I18nProvider } from "@/src/i18n/I18nProvider";

// 這兩個 CSS 變數名稱要跟 globals.css 的 `@theme inline`（--font-sans/--font-mono）對上，
// 否則 Tailwind 產生的 font-sans/font-mono utility 會指到不存在的變數，等於沒接上字型。
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vAcAnt · Italian Brainrot Casino",
  description: "vAcAnt · Italian Brainrot Casino 的用戶端入口",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#03030a] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_60%)] text-neutral-50 antialiased">
        <I18nProvider>
          <AuthProvider>
            {children}
            <AuthModal />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
