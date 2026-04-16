"use client";

// 順序：`lg` 以下顯示漢堡＋品牌，`lg` 以上再補桌面水平導覽，避免平板落在半手機半桌面的中間態。
import { HeaderBrand } from "./header/HeaderBrand";
import { HeaderNav } from "./header/HeaderNav";
import { HeaderWalletSummary } from "./header/HeaderWalletSummary";
import { HeaderUserMenu } from "./header/HeaderUserMenu";
import { MobileNavDrawer } from "./header/MobileNavDrawer";

export function MainHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-cyan-500/15 bg-neutral-950/75 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.8)] backdrop-blur-xl md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:min-w-0 md:flex-none md:gap-4">
          <MobileNavDrawer />
          <HeaderBrand />
          <HeaderNav />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <HeaderWalletSummary />
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}

