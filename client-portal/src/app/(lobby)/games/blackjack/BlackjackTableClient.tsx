"use client";

import dynamic from "next/dynamic";

const BlackjackTable = dynamic(
  () =>
    import("@/src/games/blackjack/components/BlackjackTable").then(
      (mod) => ({ default: mod.BlackjackTable }),
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
        載入遊戲中…
      </div>
    ),
  },
);

export function BlackjackTableClient() {
  return <BlackjackTable />;
}
