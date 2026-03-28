"use client";

import { useMemo, useState } from "react";
import { ProductGoToCartLink } from "@/src/components/shop/ProductGoToCartLink";
import { Button } from "@/src/components/ui/Button";
import type { ApparelSize, Product } from "@/src/shop/types";
import { useCartStore } from "@/src/store/cartStore";

type AddToCartPanelProps = {
  product: Product;
};

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const addItem = useCartStore((s) => s.addItem);
  const clearAndAdd = useCartStore((s) => s.clearAndAdd);
  const cartMode = useCartStore((s) => s.mode);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<ApparelSize>("M");
  const [message, setMessage] = useState<string | null>(null);
  const [showReplaceAction, setShowReplaceAction] = useState(false);

  const quantityOptions = useMemo(() => [1, 2, 3, 4, 5], []);
  const hasSizes = Boolean(product.sizeOptions?.length);

  const handleAdd = () => {
    const result = addItem(product.id, quantity, hasSizes ? size : undefined);
    setMessage(result.message);
    setShowReplaceAction(
      result.ok === false && result.reason === "mixed_fulfillment",
    );
  };

  const handleClearAndAdd = () => {
    const result = clearAndAdd(
      product.id,
      quantity,
      hasSizes ? size : undefined,
    );
    setMessage(result.message);
    setShowReplaceAction(false);
  };

  const cartTypeHint =
    cartMode === null
      ? "購物車目前為空，可加入任何商品。"
      : cartMode === "digital"
        ? "購物車目前為虛擬商品結帳單。"
        : "購物車目前為實體商品結帳單。";

  return (
    <div className="space-y-3 rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-3">
      {hasSizes && product.sizeOptions && (
        <>
          <label className="block text-[11px] text-neutral-400" htmlFor="size">
            尺寸
          </label>
          <select
            id="size"
            name="size"
            className="w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-cyan-400/60"
            value={size}
            onChange={(event) => setSize(event.target.value as ApparelSize)}
          >
            {product.sizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </>
      )}
      <label className="block text-[11px] text-neutral-400" htmlFor="quantity">
        數量
      </label>
      <select
        id="quantity"
        name="quantity"
        className="w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-cyan-400/60"
        value={quantity}
        onChange={(event) => setQuantity(Number(event.target.value))}
      >
        {quantityOptions.map((qty) => (
          <option key={qty} value={qty}>
            {qty}
          </option>
        ))}
      </select>
      <Button className="w-full" onClick={handleAdd}>
        加入購物車
      </Button>
      <div className="border-t border-cyan-500/20 pt-3">
        <ProductGoToCartLink />
      </div>
      {showReplaceAction && (
        <Button
          className="w-full"
          variant="outline"
          onClick={handleClearAndAdd}
        >
          清空目前購物車並加入
        </Button>
      )}
      <p className="text-[11px] text-neutral-400">{cartTypeHint}</p>
      {message && <p className="text-[11px] text-cyan-200">{message}</p>}
    </div>
  );
}
