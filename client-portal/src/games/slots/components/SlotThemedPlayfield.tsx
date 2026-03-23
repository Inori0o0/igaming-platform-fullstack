"use client";

/**
 * 單一主題老虎機畫面總成：狀態（盤面、spin、結算）、背景／橫幅／外框、5 欄 ReelColumn、
 * 結果區、轉動按鈕與側欄說明。為示範用 client 元件（含動畫與計時）。
 */
import clsx from "clsx";
import { useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import type { SlotThemeConfig } from "@/src/games/slots/config";
import {
  evaluateLineWins,
  winningCellKeys,
} from "@/src/games/slots/logic/evaluateLineWins";
import { ReelColumn } from "./slot-playfield/ReelColumn";
import { SlotPlayfieldBanner } from "./slot-playfield/SlotPlayfieldBanner";
import { SlotPlayfieldReelFrame } from "./slot-playfield/SlotPlayfieldReelFrame";
import { SlotPlayfieldShellHeader } from "./slot-playfield/SlotPlayfieldShellHeader";
import { SlotPlayfieldSidebar } from "./slot-playfield/SlotPlayfieldSidebar";
import { SlotPlayfieldSpinControls } from "./slot-playfield/SlotPlayfieldSpinControls";
import { SlotSpinResult } from "./slot-playfield/SlotSpinResult";
import { SLOT_REEL_COLS } from "./slot-playfield/constants";
import { highlightRowsForColumn } from "./slot-playfield/highlightRows";
import {
  buildInitialColumns,
  randomColumns,
} from "./slot-playfield/reelStrip";
import { useSlotCellPx } from "./slot-playfield/useSlotCellPx";

type SlotThemedPlayfieldProps = {
  theme: SlotThemeConfig;
};

export function SlotThemedPlayfield({ theme }: SlotThemedPlayfieldProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const pool = theme.symbols;
  const v = theme.visual;
  const pageBg = v.pageBackgroundSrc;
  const frameSrc = v.machineFrameSrc;
  const bannerSrc = v.titleBannerSrc;
  const shellOverArt = Boolean(pageBg || bannerSrc || frameSrc);
  const cellPx = useSlotCellPx();

  const [spinToken, setSpinToken] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [columns, setColumns] = useState(() => buildInitialColumns(pool));
  const [lastEvaluation, setLastEvaluation] = useState(() =>
    evaluateLineWins(buildInitialColumns(pool), theme),
  );

  const highlightKeys = useMemo(() => {
    if (spinning) return new Set<string>();
    return winningCellKeys(lastEvaluation.lineWins, theme);
  }, [spinning, lastEvaluation.lineWins, theme]);

  const runDemoSpin = useCallback(() => {
    if (spinning) return;
    const next = randomColumns(pool);
    setSpinning(true);
    setColumns(next);
    setSpinToken((t) => t + 1);
    /** 與 ReelColumn 動畫 duration 對齊，最後一欄停輪後才結算、解除 spinning。 */
    const maxMs = (1.05 + (SLOT_REEL_COLS - 1) * 0.18) * 1000 + 120;
    window.setTimeout(() => {
      setSpinning(false);
      setLastEvaluation(evaluateLineWins(next, theme));
    }, maxMs);
  }, [pool, spinning, theme]);

  const glitchFilter =
    v.glitchIntensity > 0 && !reduceMotion
      ? {
          filter: `drop-shadow(0 0 ${6 + v.glitchIntensity * 10}px rgba(236, 72, 153, 0.45))`,
        }
      : undefined;

  const reelColumns = Array.from({ length: SLOT_REEL_COLS }).map((_, col) => (
    <ReelColumn
      key={col}
      pool={pool}
      visual={v}
      columnIndex={col}
      spinToken={spinToken}
      spinning={!reduceMotion && spinning}
      reducedMotion={reduceMotion}
      finalTriplet={columns[col]!}
      highlightRows={highlightRowsForColumn(col, highlightKeys)}
      cellPx={cellPx}
    />
  ));

  const gridStyle = {
    gridTemplateColumns: `repeat(${SLOT_REEL_COLS}, minmax(0, 1fr))`,
  } as const;

  const reelGrid = (
    <div
      className={clsx(
        "grid min-h-0 min-w-0",
        frameSrc
          ? "w-full max-w-[min(100%,52rem)] gap-1 bg-black/35 p-1 sm:gap-2.5 sm:p-2 sm:max-w-4xl md:p-3"
          : clsx("mt-4 gap-2 rounded-2xl border p-3", v.reelFrame),
      )}
      style={gridStyle}
    >
      {reelColumns}
    </div>
  );

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl",
        pageBg && "-mx-4 px-4 py-6 md:-mx-8 md:px-8",
      )}
    >
      {pageBg ? (
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${pageBg})` }}
          aria-hidden
        />
      ) : null}

      <div className="relative z-0 space-y-4">
        {bannerSrc ? (
          <SlotPlayfieldBanner bannerSrc={bannerSrc} title={theme.headline} />
        ) : null}

        <div
          className={clsx(
            "w-full rounded-3xl border p-4",
            shellOverArt
              ? "border-cyan-500/35 bg-black/40 backdrop-blur-sm"
              : clsx("bg-linear-to-br", v.shellBorder, v.shellGradient),
          )}
          style={glitchFilter}
        >
          <SlotPlayfieldShellHeader theme={theme} hasBanner={Boolean(bannerSrc)} />

          {frameSrc ? (
            <SlotPlayfieldReelFrame frameSrc={frameSrc}>{reelGrid}</SlotPlayfieldReelFrame>
          ) : (
            reelGrid
          )}

          <div className="mt-4">
            <SlotSpinResult
              theme={theme}
              evaluation={lastEvaluation}
              spinning={spinning}
            />
          </div>

          <SlotPlayfieldSpinControls
            theme={theme}
            spinning={spinning}
            onSpin={runDemoSpin}
          />
        </div>

        <SlotPlayfieldSidebar theme={theme} />
      </div>
    </div>
  );
}
