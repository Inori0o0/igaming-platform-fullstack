"use client";

import { memo } from "react";
import { LoadingImage } from "@/src/components/loading/LoadingImage";
import { Button } from "@/src/components/ui/Button";
import {
  AVATAR_MAX_QUANTITY,
  MAX_LINE_QUANTITY,
} from "@/src/shop/constants";
import { stockAvailableForLine } from "@/src/shop/stock";
import type { ApparelSize, Product } from "@/src/shop/types";
import { useCartStore } from "@/src/store/cartStore";

type CartLineItemProps = {
  product: Product;
  size?: ApparelSize;
  quantity: number;
  lineTotal: number;
};

export const CartLineItem = memo(function CartLineItem({
  product,
  size,
  quantity,
  lineTotal,
}: CartLineItemProps) {
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const maxSelectable = Math.min(
    MAX_LINE_QUANTITY,
    Math.max(quantity, stockAvailableForLine(product, size)),
  );
  const quantityOptions = Array.from(
    { length: Math.max(1, maxSelectable) },
    (_, idx) => idx + 1,
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-neutral-950/70 p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-cyan-500/20">
        <LoadingImage
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-100">{product.name}</p>
        {product.sizeOptions && product.sizeOptions.length > 0 && size ? (
          <p className="text-xs text-neutral-500">尺寸 {size}</p>
        ) : null}
        <p className="text-xs text-neutral-400">單價 {product.priceVac.toLocaleString()} VAC</p>
        <p className="text-xs text-cyan-200">小計 {lineTotal.toLocaleString()} VAC</p>
      </div>
      <div className="flex items-center gap-2">
        {product.isAvatar ? (
          <span className="rounded-lg border border-cyan-500/20 bg-black/20 px-2 py-1 text-xs tabular-nums text-neutral-300">
            數量 {AVATAR_MAX_QUANTITY}
          </span>
        ) : (
          <select
            aria-label={`${product.name}${size ? ` ${size}` : ""} 數量`}
            className="rounded-lg border border-cyan-500/25 bg-black/30 px-2 py-1 text-xs text-neutral-100"
            value={quantity}
            onChange={(event) =>
              updateItemQuantity(product.id, Number(event.target.value), size)
            }
          >
            {quantityOptions.map((qty) => (
              <option key={qty} value={qty}>
                {qty}
              </option>
            ))}
          </select>
        )}
        <Button size="sm" variant="ghost" onClick={() => removeItem(product.id, size)}>
          移除
        </Button>
      </div>
    </div>
  );
});
