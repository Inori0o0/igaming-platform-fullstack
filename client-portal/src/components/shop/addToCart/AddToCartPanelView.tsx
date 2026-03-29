"use client";

import { ProductGoToCartLink } from "@/src/components/shop/ProductGoToCartLink";
import { Button } from "@/src/components/ui/Button";
import { addToCartMessageClassName } from "@/src/components/shop/addToCart/addToCartMessageClassName";
import type { AddToCartPanelViewModel } from "@/src/components/shop/addToCart/useAddToCartPanel";
import type { ApparelSize, Product } from "@/src/shop/types";

type AddToCartPanelViewProps = {
  product: Product;
  vm: AddToCartPanelViewModel;
};

export function AddToCartPanelView({ product, vm }: AddToCartPanelViewProps) {
  const {
    hasSizes,
    isAvatar,
    isOutOfStock,
    cartHoldsAllStock,
    size,
    setSize,
    quantityForAdd,
    quantityOptions,
    setQuantity,
    canAdd,
    handleAdd,
    handleClearAndAdd,
    cartTypeHint,
    showReplaceAction,
    message,
  } = vm;

  return (
    <div className="space-y-3 rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-3">
      {isAvatar && (
        <p className="text-[11px] text-neutral-500">
          頭像每款限 1 件，已擁有不可再買。
        </p>
      )}

      {isOutOfStock && (
        <p
          className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-center text-xs font-medium text-amber-100"
          role="status"
        >
          {hasSizes ? "此尺寸缺貨" : "缺貨"}
        </p>
      )}

      {!isOutOfStock && cartHoldsAllStock && (
        <p
          className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-100"
          role="status"
        >
          {isAvatar ? "已在購物車" : "已達購買上限"}
        </p>
      )}

      {hasSizes && product.sizeOptions && (
        <>
          <label className="block text-[11px] text-neutral-400" htmlFor="size">
            尺寸
          </label>
          <select
            id="size"
            name="size"
            disabled={isOutOfStock}
            className="w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-50"
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

      {!isAvatar && (
        <>
          <label className="block text-[11px] text-neutral-400" htmlFor="quantity">
            數量
          </label>
          {quantityOptions.length > 0 ? (
            <select
              id="quantity"
              name="quantity"
              className="w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-cyan-400/60"
              value={quantityForAdd}
              onChange={(event) => setQuantity(Number(event.target.value))}
            >
              {quantityOptions.map((qty) => (
                <option key={qty} value={qty}>
                  {qty}
                </option>
              ))}
            </select>
          ) : (
            <div
              id="quantity"
              className="rounded-lg border border-cyan-500/15 bg-black/20 px-3 py-2 text-xs text-neutral-500"
            >
              —
            </div>
          )}
        </>
      )}

      <Button className="w-full" onClick={handleAdd} disabled={!canAdd}>
        {isOutOfStock
          ? "暫無法購買"
          : cartHoldsAllStock
            ? "已在購物車"
            : "加入購物車"}
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
          清空購物車並加入
        </Button>
      )}
      {cartTypeHint ? (
        <p className="text-[11px] text-neutral-500">{cartTypeHint}</p>
      ) : null}
      {message && (
        <p className={`text-[11px] ${addToCartMessageClassName(message)}`}>
          {message}
        </p>
      )}
    </div>
  );
}
