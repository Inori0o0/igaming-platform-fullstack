"use client";

/**
 * 單一主題老虎機畫面總成：狀態（盤面、spin、結算）、背景／橫幅／外框、5 欄 ReelColumn、
 * 結果區、轉動按鈕與側欄說明。為示範用 client 元件（含動畫與計時）。
 */
import clsx from "clsx";
import { useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import type { SlotThemeConfig } from "@/src/games/slots/config";
import { useWalletStore } from "@/src/store/walletStore";
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
  // 產品規格：下注只看 totalBet（不再選 lines），固定範圍 100~100000。
  const MIN_TOTAL_BET = 100;
  const MAX_TOTAL_BET = 100000;
  const clampedDefaultBet = Math.max(
    MIN_TOTAL_BET,
    Math.min(theme.betting.defaultBet, MAX_TOTAL_BET),
  );
  const [totalBet, setTotalBet] = useState(clampedDefaultBet);
  const [spinError, setSpinError] = useState<string | undefined>(undefined);
  const [columns, setColumns] = useState(() => buildInitialColumns(pool));
  const vacBalance = useWalletStore((s) => s.balances.VAC);
  const placeSlotWager = useWalletStore((s) => s.placeSlotWager);
  const applySlotPayout = useWalletStore((s) => s.applySlotPayout);
  const [lastEvaluation, setLastEvaluation] = useState(() =>
    evaluateLineWins(buildInitialColumns(pool), theme, {
      totalBet: clampedDefaultBet,
    }),
  );

  const highlightKeys = useMemo(() => {
    if (spinning) return new Set<string>();
    return winningCellKeys(lastEvaluation.lineWins, theme);
  }, [spinning, lastEvaluation.lineWins, theme]);

  const runDemoSpin = useCallback(async () => {
    if (spinning) return;
    if (vacBalance < totalBet) {
      setSpinError("餘額不足，無法下注。");
      return;
    }

    setSpinError(undefined);
    const prevColumns = columns;
    const next = randomColumns(pool);
    const roundId = crypto.randomUUID();
    const wagerPromise = placeSlotWager({
      themeId: theme.id,
      totalBet,
      roundId,
    });

    let cancelled = false;
    void wagerPromise.then((ok) => {
      if (ok) return;
      // 下注失敗：停止動畫並回到前一盤，避免玩家誤以為本局已成立。
      cancelled = true;
      setSpinning(false);
      setColumns(prevColumns);
      setSpinToken((t) => t + 1);
      setSpinError("下注失敗，請稍後再試。");
    });

    // UX: 按下即開轉動動畫，後台下注確認與動畫並行。
    setColumns(next);
    setSpinToken((t) => t + 1);
    setSpinning(true);

    /** 與 ReelColumn 動畫 duration 對齊，最後一欄停輪後才結算、解除 spinning。 */
    const maxMs = (1.05 + (SLOT_REEL_COLS - 1) * 0.18) * 1000 + 120;
    window.setTimeout(async () => {
      if (cancelled) return;
      const wagerOk = await wagerPromise;
      if (!wagerOk) return;

      // 只在 wager 成功後結算與派彩，確保「扣款→轉動→派彩」順序一致。
      const evaluation = evaluateLineWins(next, theme, {
        totalBet,
      });
      setSpinning(false);
      setLastEvaluation(evaluation);
      await applySlotPayout({
        themeId: theme.id,
        payout: evaluation.totalCredits,
        totalBet,
        roundId,
      });
    }, maxMs);
  }, [
    applySlotPayout,
    placeSlotWager,
    pool,
    spinning,
    theme,
    totalBet,
    vacBalance,
    columns,
  ]);

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
            totalBet={totalBet}
            vacBalance={vacBalance}
            onTotalBetChange={(next) => {
              const clamped = Math.max(MIN_TOTAL_BET, Math.min(next, MAX_TOTAL_BET));
              setTotalBet(Number.isFinite(clamped) ? clamped : clampedDefaultBet);
              setSpinError(undefined);
            }}
            spinError={spinError}
          />
        </div>

        <SlotPlayfieldSidebar
          theme={theme}
          totalBet={totalBet}
        />
      </div>
    </div>
  );
}
