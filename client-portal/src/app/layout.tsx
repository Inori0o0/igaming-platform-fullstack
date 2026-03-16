import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/components/auth/AuthProvider";
import { AuthModal } from "@/src/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "vAcAnt: 加密貨幣賭場",
  description: "vAcAnt 加密貨幣賭場的用戶端入口",
  icons: {
    icon: "/icon.svg",
  },
};

// 全站都具備「一進來就檢查登入」和「隨時能開登入／註冊彈窗」的能力
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
