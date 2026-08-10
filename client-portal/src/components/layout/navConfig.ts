import type { Translator } from "@shared/i18n";
import type { SidebarItem } from "./sidebar/SidebarSection";

/** 頂欄五連結（md+）；與左欄不同：不含子路由捷徑。 */
export function getHeaderNavItems(t: Translator): { href: string; label: string }[] {
  return [
    { href: "/", label: t("nav.home") },
    { href: "/games", label: t("nav.games") },
    { href: "/shop", label: t("nav.shop") },
    { href: "/wallet", label: t("nav.wallet") },
    { href: "/profile", label: t("nav.profile") },
  ];
}

/** 左欄與手機漢堡選單共用（lg+ 見 MainSidebar；更窄時見 MobileNavDrawer）。改導覽只改這裡。 */
export function getLobbySidebarSections(
  t: Translator,
): { title: string; items: SidebarItem[] }[] {
  return [
    {
      title: t("nav.sectionCasino"),
      items: [
        { href: "/games", label: t("nav.games") },
        { href: "/games/slots", label: t("nav.slots") },
        { href: "/games/blackjack", label: t("nav.blackjack") },
        { href: "/games/baccarat", label: t("nav.baccarat") },
        { href: "/games/lottery", label: t("nav.lottery") },
      ],
    },
    {
      title: t("nav.sectionShop"),
      items: [
        { href: "/shop", label: t("nav.shop") },
        { href: "/cart", label: t("nav.cart") },
        { href: "/checkout", label: t("nav.checkout") },
      ],
    },
    {
      title: t("nav.sectionAccount"),
      items: [
        { href: "/wallet", label: t("nav.wallet") },
        { href: "/profile", label: t("nav.profile") },
        { href: "/profile/history", label: t("nav.history") },
        { href: "/profile/orders", label: t("nav.orders") },
        { href: "/profile/achievements", label: t("nav.achievements") },
      ],
    },
  ];
}
