import type { SidebarItem } from "./sidebar/SidebarSection";

export const headerNavItems: { href: string; label: string }[] = [
  { href: "/", label: "首頁" },
  { href: "/games", label: "遊戲大廳" },
  { href: "/shop", label: "商品商店" },
  { href: "/wallet", label: "錢包" },
  { href: "/profile", label: "個人中心" },
];

export const lobbySidebarSections: { title: string; items: SidebarItem[] }[] = [
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
