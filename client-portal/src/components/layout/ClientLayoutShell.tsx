"use client";

import { MainHeader } from "@/src/components/layout/MainHeader";
import { MainSidebar } from "@/src/components/layout/MainSidebar";
import { MainFooter } from "@/src/components/layout/MainFooter";
import { SplashScreen } from "@/src/components/loading/SplashScreen";
import { useAuthStore } from "@/src/store/authStore";

type ClientLayoutShellProps = {
  children: React.ReactNode;
};

export function ClientLayoutShell({ children }: ClientLayoutShellProps) {
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  return (
    <>
      <SplashScreen show={isAuthLoading} mode="fullscreen" />

      <div className="flex min-h-screen">
        <MainSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <MainHeader />
          <main className="relative flex-1 px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
            {children}
          </main>
          <MainFooter />
        </div>
      </div>
    </>
  );
}
