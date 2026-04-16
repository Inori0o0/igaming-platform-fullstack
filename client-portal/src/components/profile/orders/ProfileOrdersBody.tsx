"use client";

import Link from "next/link";
import { LogoLoader } from "@/src/components/loading/LogoLoader";
import { ProfileOrderRow } from "@/src/components/profile/orders/ProfileOrderRow";
import type { ProfileOrderRow as OrderRow } from "@/src/components/profile/orders/types";

type ProfileOrdersBodyProps = {
  orders: OrderRow[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  copiedId: string | null;
  onCopyOrderId: (id: string) => void;
};

export function ProfileOrdersBody({
  orders,
  loading,
  error,
  onRetry,
  copiedId,
  onCopyOrderId,
}: ProfileOrdersBodyProps) {
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-rose-300/90">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-cyan-500/35 bg-neutral-950/80 px-3 py-2 text-xs font-semibold text-cyan-100/95 transition hover:border-cyan-400/50 hover:bg-neutral-900/90"
        >
          重新載入
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-28 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-8">
        <LogoLoader size="md" className="text-cyan-300" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center">
        <p className="text-sm text-neutral-400">尚無訂單。</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex w-full max-w-xs items-center justify-center rounded-xl border border-cyan-300/70 bg-cyan-400 px-4 py-3 text-sm font-semibold text-neutral-950 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition hover:border-cyan-200 hover:bg-cyan-300 sm:w-auto"
        >
          去商店逛逛
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {orders.map((o) => (
        <ProfileOrderRow
          key={o.id}
          order={o}
          copiedId={copiedId}
          onCopyOrderId={onCopyOrderId}
        />
      ))}
    </ul>
  );
}
