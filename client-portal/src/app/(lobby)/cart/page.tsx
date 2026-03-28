"use client";

import Link from "next/link";
import { CartCouponCard } from "@/src/components/shop/CartCouponCard";
import { CartItemsCard } from "@/src/components/shop/CartItemsCard";
import { CartSummaryCard } from "@/src/components/shop/CartSummaryCard";
import { useCartViewModel } from "@/src/components/shop/useCartViewModel";

export default function CartPage() {
  const {
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
  } = useCartViewModel();

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Cart
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            購物車
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            虛擬商品與實體商品分開結帳，購物車一次只能放同一類型商品。
          </p>
        </div>
        <Link
          href="/checkout"
          className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:border-cyan-400/40 hover:bg-cyan-500/15 disabled:pointer-events-none disabled:opacity-50"
          aria-disabled={items.length === 0}
        >
          前往結帳 →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <CartItemsCard
          cartRows={cartRows}
          mode={mode}
          onQuantityChange={updateItemQuantity}
          onRemove={removeItem}
        />

        <div className="space-y-4">
          <CartSummaryCard summary={summary} />
          <CartCouponCard
            couponInput={couponInput}
            onCouponInputChange={setCouponInput}
            coupon={coupon}
            couponMessage={couponMessage}
            onApply={handleApplyCoupon}
            onClear={handleClearCoupon}
          />
        </div>
      </div>
    </main>
  );
}
