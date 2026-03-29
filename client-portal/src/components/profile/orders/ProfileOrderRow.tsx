"use client";

import Link from "next/link";
import { cn } from "@/src/lib/cn";
import { formatVac, fulfillmentLabel, orderStatusLabel, shortOrderId } from "@/src/components/profile/orders/orderDisplay";
import type { ProfileOrderRow } from "@/src/components/profile/orders/types";

type ProfileOrderRowProps = {
  order: ProfileOrderRow;
  copiedId: string | null;
  onCopyOrderId: (id: string) => void;
};

export function ProfileOrderRow({ order: o, copiedId, onCopyOrderId }: ProfileOrderRowProps) {
  return (
    <li className="overflow-hidden rounded-2xl border border-neutral-800/90 bg-neutral-950/70">
      <Link
        href={`/profile/orders/${o.id}`}
        className={cn("block px-4 py-3 transition", "hover:bg-neutral-950/90")}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-neutral-400">
            {new Date(o.created_at).toLocaleString("zh-TW", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
          <span className="text-sm font-semibold tabular-nums text-cyan-200/95">
            {formatVac(o.total_vac)} VAC
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500">
          <span>{orderStatusLabel(o.status)}</span>
          <span>·</span>
          <span>{fulfillmentLabel(o.fulfillment_type)}</span>
          {o.coupon_code ? (
            <>
              <span>·</span>
              <span>優惠碼 {o.coupon_code}</span>
            </>
          ) : null}
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-neutral-800/80 px-4 py-2">
        <span
          className="min-w-0 truncate font-mono text-[10px] text-neutral-500"
          title={o.id}
        >
          {shortOrderId(o.id)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            void onCopyOrderId(o.id);
          }}
          className="shrink-0 rounded-md border border-cyan-500/25 bg-neutral-950/80 px-2 py-1 text-[10px] font-semibold text-cyan-200/90 transition hover:border-cyan-400/45"
        >
          {copiedId === o.id ? "已複製" : "複製編號"}
        </button>
      </div>
    </li>
  );
}
