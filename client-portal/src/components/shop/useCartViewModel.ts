"use client";

import { useEffect, useMemo, useState } from "react";
import { shopProducts } from "@/src/shop/products";
import { calculateCartSummary, useCartStore } from "@/src/store/cartStore";

export function useCartViewModel() {
  const hydrate = useCartStore((s) => s.hydrate);
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const mode = useCartStore((s) => s.mode);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const clearCoupon = useCartStore((s) => s.clearCoupon);

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const cartRows = useMemo(
    () =>
      items.flatMap((item) => {
        const product = shopProducts.find((p) => p.id === item.productId);
        if (!product) return [];
        return [
          {
            product,
            quantity: item.quantity,
            lineTotal: product.priceVac * item.quantity,
          },
        ];
      }),
    [items],
  );

  const summary = useMemo(() => calculateCartSummary(items, coupon), [items, coupon]);

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponInput);
    setCouponMessage(result.message);
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
    handleApplyCoupon,
    handleClearCoupon,
    removeItem,
    updateItemQuantity,
  };
}
