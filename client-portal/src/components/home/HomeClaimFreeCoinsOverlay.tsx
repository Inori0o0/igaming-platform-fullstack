"use client";

import { useClaimFreeCoinsOverlay } from "@/src/components/home/useClaimFreeCoinsOverlay";
import { ClaimFreeCoinsCTAButton } from "@/src/components/home/ClaimFreeCoinsCTAButton";

export function HomeClaimFreeCoinsOverlay() {
  const { onClaim, claimedFeedback } = useClaimFreeCoinsOverlay();

  return (
    <div className="animate-pulse">
      <div
        className={[
          "rounded-3xl border border-cyan-300/45 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_65%)] p-[2px]",
          "shadow-[0_0_90px_rgba(34,211,238,0.38)]",
        ].join(" ")}
      >
        <ClaimFreeCoinsCTAButton
          onClaim={onClaim}
          claimedFeedback={claimedFeedback}
        />
      </div>
    </div>
  );
}
