import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/components/auth/AuthProvider";
import { AuthModal } from "@/src/components/auth/AuthModal";
import { MainHeader } from "@/src/components/layout/MainHeader";
import { MainSidebar } from "@/src/components/layout/MainSidebar";
import { MainFooter } from "@/src/components/layout/MainFooter";

export const metadata: Metadata = {
  title: "vAcAnt · Italian Brainrot Casino",
  description: "vAcAnt · Italian Brainrot Casino 的用戶端入口",
  icons: {
    icon: "/icon.svg",
  },
};

// 全站 layout：Header + Sidebar + Main + Footer
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-[#03030a] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_60%)] text-neutral-50 antialiased">
        <AuthProvider>
          <div className="flex min-h-screen">
            <MainSidebar />
            <div className="flex min-h-screen flex-1 flex-col">
              <MainHeader />
              <main className="flex-1 px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
                {children}
              </main>
              <MainFooter />
            </div>
          </div>
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
