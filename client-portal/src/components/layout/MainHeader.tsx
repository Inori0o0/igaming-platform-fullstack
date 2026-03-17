"use client";

import { HeaderBrand } from "./header/HeaderBrand";
import { HeaderNav } from "./header/HeaderNav";
import { HeaderWalletSummary } from "./header/HeaderWalletSummary";
import { HeaderUserMenu } from "./header/HeaderUserMenu";

export function MainHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-cyan-500/15 bg-neutral-950/75 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.8)] backdrop-blur-xl md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <HeaderBrand />
          <HeaderNav />
        </div>

        <div className="flex items-center gap-3">
          <HeaderWalletSummary />
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}

