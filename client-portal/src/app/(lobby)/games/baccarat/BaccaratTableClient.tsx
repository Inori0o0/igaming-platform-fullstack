"use client";

import dynamic from "next/dynamic";

const BaccaratTable = dynamic(
  () =>
    import("@/src/games/baccarat/components/BaccaratTable").then(
      (mod) => ({ default: mod.BaccaratTable }),
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

export function BaccaratTableClient() {
  return <BaccaratTable />;
}
