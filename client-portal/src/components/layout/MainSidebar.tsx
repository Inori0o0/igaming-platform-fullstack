"use client";

import { usePathname } from "next/navigation";
import { SidebarSection, type SidebarItem } from "./sidebar/SidebarSection";

const sections: { title: string; items: SidebarItem[] }[] = [
  {
    title: "Casino",
    items: [
      { href: "/games", label: "遊戲大廳" },
      { href: "/games/slots", label: "老虎機 Slots" },
      { href: "/games/blackjack", label: "二十一點" },
      { href: "/games/baccarat", label: "百家樂" },
      { href: "/games/lottery", label: "Lottery 彩票" },
    ],
  },
  {
    title: "Shop",
    items: [
      { href: "/shop", label: "商品商店" },
      { href: "/cart", label: "購物車" },
      { href: "/checkout", label: "結帳" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/wallet", label: "錢包" },
      { href: "/profile", label: "個人中心" },
      { href: "/profile/history", label: "遊戲歷史" },
      { href: "/profile/orders", label: "訂單歷史" },
      { href: "/profile/achievements", label: "成就" },
    ],
  },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-none border-r border-cyan-500/15 bg-neutral-950/90 pb-6 pt-4 shadow-[0_0_80px_rgba(15,23,42,0.9)] backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col gap-6 px-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          vAcAnt Lobby
        </div>
        <nav className="space-y-5 text-sm text-neutral-300">
          {sections.map((section) => (
            <SidebarSection
              key={section.title}
              title={section.title}
              items={section.items}
              pathname={pathname}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

