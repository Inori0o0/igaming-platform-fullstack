"use client";

/**
 * 單一欄轉輪：內部是一條長符號帶（reelStrip），用 Framer Motion 把 y 捲到最後三格對齊視窗；
 * 停輪後可見三格即本局該欄結果。`highlightRows` 標示中獎列。
 */
import { motion } from "framer-motion";
import { useMemo } from "react";
import type { SlotSymbol, SlotThemeConfig } from "@/src/games/slots/config";
import {
  SLOT_CELL_PX,
  SLOT_REEL_ROWS,
  noiseLengthForColumn,
} from "./constants";
import { ReelSymbolContent } from "./ReelSymbolContent";
import { buildStrip } from "./reelStrip";

export type ReelColumnProps = {
  pool: readonly SlotSymbol[];
  visual: SlotThemeConfig["visual"];
  columnIndex: number;
  spinToken: number;
  spinning: boolean;
  reducedMotion: boolean;
  finalTriplet: readonly SlotSymbol[];
  /** 可見三格中需高亮的 row（0=上,1=中,2=下） */
  highlightRows?: ReadonlySet<number>;
  /** 單格高度（px），響應式時由父層傳入 */
  cellPx?: number;
};

export function ReelColumn({
  pool,
  visual,
  columnIndex,
  spinToken,
  spinning,
  reducedMotion,
  finalTriplet,
  highlightRows,
  cellPx: cellPxProp,
}: ReelColumnProps) {
  const cellPx = cellPxProp ?? SLOT_CELL_PX;
  const reelWindowH = SLOT_REEL_ROWS * cellPx;
  const symbolMaxPx = Math.round(cellPx * 0.92);
  const textSizeClass =
    cellPx < 44
      ? "text-base"
      : cellPx < 52
        ? "text-lg"
        : cellPx < 64
          ? "text-xl"
          : cellPx < 80
            ? "text-2xl"
            : "text-3xl";

  const noiseLength = noiseLengthForColumn(columnIndex);
  const strip = useMemo(
    () =>
      buildStrip(
        pool,
        finalTriplet,
        noiseLength,
        spinToken + columnIndex * 5,
      ),
    [pool, finalTriplet, noiseLength, spinToken, columnIndex],
  );

  /** 捲動終點：讓 strip 最後三格落在可視窗內（負值 = 向上移）。 */
  const targetY = -(strip.length - SLOT_REEL_ROWS) * cellPx;

  if (reducedMotion) {
    return (
      <div
        className={`flex flex-col overflow-hidden rounded-lg border ${visual.cellSurface}`}
        style={{ height: reelWindowH }}
      >
        {finalTriplet.map((sym, row) => (
          <div
            key={`${sym.id}-${sym.display}-${row}`}
            className={`flex items-center justify-center border-b border-white/5 font-semibold last:border-b-0 ${textSizeClass} ${visual.symbolText} ${
              highlightRows?.has(row)
                ? "ring-2 ring-inset ring-cyan-300/75 bg-cyan-500/10"
                : ""
            }`}
            style={{ height: cellPx }}
          >
            <ReelSymbolContent
              sym={sym}
              textClassName={visual.symbolText}
              symbolMaxPx={symbolMaxPx}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${visual.cellSurface}`}
      style={{ height: reelWindowH }}
    >
      <motion.div
        key={spinToken}
        className="flex flex-col"
        initial={{ y: 0 }}
        animate={{ y: targetY }}
        transition={{
          duration: spinning ? 1.05 + columnIndex * 0.18 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {strip.map((sym, idx) => {
          /** 此格在「可視三格」中的列 index 0..2，其餘為滾動途中的雜訊格。 */
          const row = idx - (strip.length - SLOT_REEL_ROWS);
          const inWindow = row >= 0 && row < SLOT_REEL_ROWS;
          const highlight = inWindow && highlightRows?.has(row);
          return (
            <div
              key={`${idx}-${sym.id}`}
              className={`flex items-center justify-center border-b border-white/5 font-semibold ${textSizeClass} ${visual.symbolText} ${
                highlight
                  ? "ring-2 ring-inset ring-cyan-300/75 bg-cyan-500/10"
                  : ""
              }`}
              style={{ height: cellPx }}
            >
              <ReelSymbolContent
                sym={sym}
                textClassName={visual.symbolText}
                symbolMaxPx={symbolMaxPx}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
