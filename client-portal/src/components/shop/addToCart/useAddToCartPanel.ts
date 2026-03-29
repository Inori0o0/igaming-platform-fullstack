"use client";

import { useMemo, useState } from "react";
import { stockAvailableForLine } from "@/src/shop/stock";
import type { ApparelSize, Product } from "@/src/shop/types";
import { useCartStore } from "@/src/store/cartStore";

export function useAddToCartPanel(product: Product) {
  const addItem = useCartStore((s) => s.addItem);
  const clearAndAdd = useCartStore((s) => s.clearAndAdd);
  const cartMode = useCartStore((s) => s.mode);
  const cartItems = useCartStore((s) => s.items);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<ApparelSize>("M");
  const [message, setMessage] = useState<string | null>(null);
  const [showReplaceAction, setShowReplaceAction] = useState(false);

  const hasSizes = Boolean(product.sizeOptions?.length);
  const isAvatar = Boolean(product.isAvatar);

  const inCartQty = useMemo(() => {
    const line = cartItems.find(
      (item) =>
        item.productId === product.id &&
        (!hasSizes || (item.size ?? "M") === size),
    );
    return line?.quantity ?? 0;
  }, [cartItems, product.id, size, hasSizes]);

  const lineCap = stockAvailableForLine(product, hasSizes ? size : undefined);
  const isOutOfStock = lineCap <= 0;
  const remaining = Math.max(0, lineCap - inCartQty);
  const maxSelectable = isOutOfStock
    ? 0
    : isAvatar
      ? inCartQty >= 1
        ? 0
        : 1
      : Math.min(5, remaining);
  const cartHoldsAllStock =
    !isOutOfStock &&
    maxSelectable <= 0 &&
    (isAvatar ? inCartQty >= 1 : lineCap > 0 && remaining <= 0);

  const quantityOptions = useMemo(
    () => Array.from({ length: maxSelectable }, (_, i) => i + 1),
    [maxSelectable],
  );

  const quantityForAdd = useMemo(() => {
    if (isAvatar) return 1;
    if (quantityOptions.length === 0) return 1;
    const cap = quantityOptions[quantityOptions.length - 1]!;
    return Math.min(Math.max(1, quantity), cap);
  }, [isAvatar, quantity, quantityOptions]);

  const canAdd = !isOutOfStock && maxSelectable > 0;

  const handleAdd = () => {
    const result = addItem(
      product.id,
      quantityForAdd,
      hasSizes ? size : undefined,
    );
    setMessage(result.message);
    setShowReplaceAction(
      result.ok === false && result.reason === "mixed_fulfillment",
    );
  };

  const handleClearAndAdd = () => {
    const result = clearAndAdd(
      product.id,
      quantityForAdd,
      hasSizes ? size : undefined,
    );
    setMessage(result.message);
    setShowReplaceAction(false);
  };

  const cartTypeHint = isAvatar
    ? cartMode === null
      ? ""
      : cartMode === "digital"
        ? "可與其他虛擬商品一併結帳"
        : "請先清空購物車"
    : cartMode === null
      ? ""
      : cartMode === "digital"
        ? "虛擬商品結帳"
        : "實體商品結帳";

  return {
    hasSizes,
    isAvatar,
    isOutOfStock,
    cartHoldsAllStock,
    size,
    setSize,
    quantity,
    setQuantity,
    quantityForAdd,
    quantityOptions,
    canAdd,
    handleAdd,
    handleClearAndAdd,
    cartTypeHint,
    showReplaceAction,
    message,
  };
}

export type AddToCartPanelViewModel = ReturnType<typeof useAddToCartPanel>;
