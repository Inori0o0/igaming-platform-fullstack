"use client";

import dynamic from "next/dynamic";
import type { SlotThemeConfig } from "@/src/games/slots/config";

const SlotThemedPlayfield = dynamic(
  () =>
    import("@/src/games/slots/components/SlotThemedPlayfield").then(
      (mod) => ({ default: mod.SlotThemedPlayfield }),
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

export function SlotThemedPlayfieldClient({ theme }: { theme: SlotThemeConfig }) {
  return <SlotThemedPlayfield theme={theme} />;
}
