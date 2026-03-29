import Link from "next/link";

/** 商品詳情右欄用：大而顯眼的購物車入口，與頂部「回商店」分開。 */
export function ProductGoToCartLink() {
  return (
    <Link
      href="/cart"
      className="flex w-full items-center justify-center rounded-xl border-2 border-cyan-400/45 bg-linear-to-b from-cyan-500/20 to-cyan-500/5 px-4 py-3.5 text-base font-semibold tracking-wide text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.4)] transition hover:border-cyan-300/70 hover:from-cyan-500/30 hover:to-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
      aria-label="前往購物車"
    >
      前往購物車
    </Link>
  );
}
