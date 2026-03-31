"use client";

import { Button } from "@/src/components/ui/Button";

type ClaimActionProps = {
  onClaimFreeCoins: () => void;
};

export function ClaimAction({ onClaimFreeCoins }: ClaimActionProps) {
  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
        免費領取
      </p>
      <p className="mt-1 text-xs text-neutral-300">
        每次領取 6,767 vAcAnt Coins
      </p>
      <Button className="mt-3" size="sm" onClick={onClaimFreeCoins}>
        領取 6,767 Coins
      </Button>
    </div>
  );
}
