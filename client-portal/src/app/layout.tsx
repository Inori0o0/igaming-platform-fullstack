import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/components/auth/AuthProvider";
import { AuthModal } from "@/src/components/auth/AuthModal";

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
    <html lang="zh-TW">
      <body className="min-h-screen bg-[#03030a] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_60%)] text-neutral-50 antialiased">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
