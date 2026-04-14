import type { SidebarItem } from "./sidebar/SidebarSection";

/** 頂欄五連結（md+）；與左欄不同：不含子路由捷徑。 */
export const headerNavItems: { href: string; label: string }[] = [
  { href: "/", label: "首頁" },
  { href: "/games", label: "遊戲大廳" },
  { href: "/shop", label: "商品商店" },
  { href: "/wallet", label: "錢包" },
  { href: "/profile", label: "個人中心" },
];

/** 左欄與手機漢堡選單共用（lg+ 見 MainSidebar；更窄時見 MobileNavDrawer）。改導覽只改這裡。 */
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
