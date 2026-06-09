"use client";

// Splash 與主殼為兄弟節點（非包在 div 內），fullscreen 時蓋住全畫面；Auth 結束後底下版面才可操作。
import { usePathname } from "next/navigation";
import { MainHeader } from "@/src/components/layout/MainHeader";
import { MainSidebar } from "@/src/components/layout/MainSidebar";
import { MainFooter } from "@/src/components/layout/MainFooter";
import { SplashScreen } from "@/src/components/loading/SplashScreen";
import { ShopCatalogHydrator } from "@/src/components/shop/ShopCatalogHydrator";
import { useAuthStore } from "@/src/store/authStore";

type ClientLayoutShellProps = {
  children: React.ReactNode;
};

export function ClientLayoutShell({ children }: ClientLayoutShellProps) {
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const pathname = usePathname();

  // 遊戲頁已有自己的 SplashScreen（含圖片預載），不再疊加 auth splash。
  // 兩個 SplashScreen 同時存在時，各自的 neon-pulse filter 動畫並行，
  // GPU 合成負擔加倍，導致遊戲頁 hard refresh 時畫面抖動。
  const isGamePage = pathname.startsWith("/games/");

  return (
    <>
      <ShopCatalogHydrator />
      <SplashScreen show={isAuthLoading && !isGamePage} mode="fullscreen" />

      <div className="flex min-h-screen">
        <MainSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <MainHeader />
          <main className="relative flex flex-1 flex-col px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
            {children}
          </main>
          <MainFooter />
        </div>
      </div>
    </>
  );
}
