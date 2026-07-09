"use client";

/**
 * 商品目錄若目前是離線示範資料（catalogSource === "mock"），在瀏覽/購物車/結帳頁面
 * 一律顯示提示，而不是像過去一樣完全靜默，直到結帳送出才因缺 dbProductId 報錯。
 */
import { usePathname } from "next/navigation";
import { useShopCatalogStore } from "@/src/store/shopCatalogStore";

const RELEVANT_PATH_PREFIXES = ["/shop", "/cart", "/checkout"];

export function ShopCatalogStatusBanner() {
  const pathname = usePathname();
  const catalogSource = useShopCatalogStore((s) => s.catalogSource);

  const isRelevantPage = RELEVANT_PATH_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );
  if (!isRelevantPage || catalogSource !== "mock") return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
      目前商品資料來自離線示範內容（無法連上商店伺服器），價格、庫存與結帳可能不是最新狀態。
      請重新整理頁面，若持續發生請稍後再試。
    </div>
  );
}
