"use client";

import { MainHeader } from "@/src/components/layout/MainHeader";
import { MainSidebar } from "@/src/components/layout/MainSidebar";
import { MainFooter } from "@/src/components/layout/MainFooter";
import { SplashScreen } from "@/src/components/loading/SplashScreen";
import { LogoLoader } from "@/src/components/loading/LogoLoader";
import { useInitialSplash } from "@/src/components/loading/useInitialSplash";
import { useAuthStore } from "@/src/store/authStore";

type ClientLayoutShellProps = {
  children: React.ReactNode;
};

export function ClientLayoutShell({ children }: ClientLayoutShellProps) {
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const { shouldShowInitialSplash, shouldShowInlineLoading } = useInitialSplash({
    isAuthLoading,
  });

  return (
    <>
      {shouldShowInitialSplash && (
        <SplashScreen show mode="fullscreen" />
      )}
      <div className="flex min-h-screen">
        <MainSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <MainHeader />
          <main className="relative flex-1 px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
            {shouldShowInlineLoading && (
              <div className="pointer-events-none absolute right-4 top-4 z-10 hidden items-center gap-2 rounded-full border border-cyan-500/20 bg-neutral-950/80 px-3 py-2 text-xs text-neutral-200 shadow-[0_0_24px_rgba(34,211,238,0.25)] backdrop-blur md:flex">
                <LogoLoader size="xs" />
                <span className="text-neutral-300">同步中…</span>
              </div>
            )}
            {children}
          </main>
          <MainFooter />
        </div>
      </div>
    </>
  );
}

