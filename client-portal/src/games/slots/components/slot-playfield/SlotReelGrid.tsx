"use client";

import clsx from "clsx";
import type { SlotSymbol, SlotThemeConfig } from "@/src/games/slots/config";
import { ReelColumn } from "./ReelColumn";
import { SlotPlayfieldReelFrame } from "./SlotPlayfieldReelFrame";
import { SLOT_REEL_COLS } from "./constants";
import { highlightRowsForColumn } from "./highlightRows";

type SlotReelGridProps = {
  pool: readonly SlotSymbol[];
  visual: SlotThemeConfig["visual"];
  frameSrc?: string;
  spinToken: number;
  spinning: boolean;
  reducedMotion: boolean;
  columns: readonly (readonly SlotSymbol[])[];
  highlightKeys: ReadonlySet<string>;
  cellPx: number;
};

export function SlotReelGrid({
  pool,
  visual,
  frameSrc,
  spinToken,
  spinning,
  reducedMotion,
  columns,
  highlightKeys,
  cellPx,
}: SlotReelGridProps) {
  const gridStyle = {
    gridTemplateColumns: `repeat(${SLOT_REEL_COLS}, minmax(0, 1fr))`,
  } as const;

  const reelColumns = Array.from({ length: SLOT_REEL_COLS }).map((_, col) => (
    <ReelColumn
      key={col}
      pool={pool}
      visual={visual}
      columnIndex={col}
      spinToken={spinToken}
      spinning={!reducedMotion && spinning}
      reducedMotion={reducedMotion}
      finalTriplet={columns[col]!}
      highlightRows={highlightRowsForColumn(col, highlightKeys)}
      cellPx={cellPx}
    />
  ));

  const reelGrid = (
    <div
      className={clsx(
        "grid min-h-0 min-w-0",
        frameSrc
          ? "w-full max-w-[min(100%,52rem)] gap-1 bg-black/35 p-1 sm:max-w-4xl sm:gap-2.5 sm:p-2 md:p-3"
          : clsx("mt-4 gap-2 rounded-2xl border p-3", visual.reelFrame),
      )}
      style={gridStyle}
    >
      {reelColumns}
    </div>
  );

  if (frameSrc) {
    return <SlotPlayfieldReelFrame frameSrc={frameSrc}>{reelGrid}</SlotPlayfieldReelFrame>;
  }

  return reelGrid;
}
