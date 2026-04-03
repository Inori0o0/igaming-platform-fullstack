"use client";

import Link from "next/link";
import { CartCouponCard } from "@/src/components/shop/CartCouponCard";
import { cn } from "@/src/lib/cn";
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
    couponLoading,
    handleApplyCoupon,
    handleClearCoupon,
    removeItem,
    updateItemQuantity,
  } = useCartViewModel();

  const checkoutButton = (
    <Link
      href={items.length === 0 ? "#" : "/checkout"}
      onClick={(e) => {
        if (items.length === 0) e.preventDefault();
      }}
      aria-disabled={items.length === 0}
      tabIndex={items.length === 0 ? -1 : undefined}
      className={cn(
        "flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-base font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03030a]",
        items.length === 0
          ? "pointer-events-none cursor-not-allowed border border-neutral-700/60 bg-neutral-900/60 text-neutral-500 opacity-60"
          : "border border-cyan-300/70 bg-cyan-400 text-neutral-950 shadow-[0_0_20px_rgba(34,211,238,0.55),0_0_44px_rgba(34,211,238,0.22)] hover:border-cyan-200 hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.75),0_0_52px_rgba(34,211,238,0.3)] active:translate-y-px",
      )}
    >
      前往結帳
    </Link>
  );

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Cart
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            購物車
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            實體／虛擬分開結帳，同車僅限同一類型。
          </p>
        </div>
        <Link
          href="/shop"
          className="shrink-0 rounded-full border border-cyan-500/25 bg-neutral-950/80 px-4 py-2 text-xs font-semibold text-cyan-100/95 transition hover:border-cyan-400/45 hover:bg-neutral-900/90 hover:text-cyan-50"
        >
          ← 繼續購物
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
          <CartSummaryCard summary={summary} footer={checkoutButton} />
          <CartCouponCard
            couponInput={couponInput}
            onCouponInputChange={setCouponInput}
            coupon={coupon}
            couponMessage={couponMessage}
            applyLoading={couponLoading}
            onApply={() => void handleApplyCoupon()}
            onClear={handleClearCoupon}
            cartMode={mode}
          />
        </div>
      </div>
    </main>
  );
}
