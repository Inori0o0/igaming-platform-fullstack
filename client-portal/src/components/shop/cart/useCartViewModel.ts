"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateCartSummary, useCartStore } from "@/src/store/cartStore";
import { useShopCatalogStore } from "@/src/store/shopCatalogStore";
import { useAuthStore } from "@/src/store/authStore";
import { showToast } from "@/src/store/toastStore";

export function useCartViewModel() {
  const userId = useAuthStore((s) => s.user?.id);
  const hydrate = useCartStore((s) => s.hydrate);
  const catalog = useShopCatalogStore((s) => s.products);
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const mode = useCartStore((s) => s.mode);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const clearCoupon = useCartStore((s) => s.clearCoupon);

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    // 依賴 userId：登入/登出/切換帳號時（頁面未重新 mount）也要換成對應身份的購物車快照，
    // 否則會一直顯示切換前的身份殘留資料。
    hydrate();
  }, [hydrate, userId]);

  const cartRows = useMemo(
    () =>
      items.flatMap((item) => {
        const product = catalog.find((p) => p.id === item.productId);
        if (!product) return [];
        return [
          {
            product,
            quantity: item.quantity,
            size: item.size,
            lineTotal: product.priceVac * item.quantity,
          },
        ];
      }),
    [items, catalog],
  );

  const summary = useMemo(
    () => calculateCartSummary(items, coupon, catalog),
    [items, coupon, catalog],
  );

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const result = await applyCoupon(couponInput);
      setCouponMessage(result.ok ? null : result.message);
      if (result.ok) {
        showToast("success", result.message);
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleClearCoupon = () => {
    clearCoupon();
    setCouponMessage(null);
  };

  return {
    items,
    cartRows,
    summary,
    mode,
    coupon,
    couponInput,
    setCouponInput,
    couponMessage,
    couponLoading,
    handleApplyCoupon,
    handleClearCoupon,
    removeItem,
    updateItemQuantity,
  };
}
