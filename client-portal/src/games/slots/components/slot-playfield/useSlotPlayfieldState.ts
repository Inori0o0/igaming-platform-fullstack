"use client";

import { useCallback, useMemo, useState } from "react";
import type { SlotThemeConfig } from "@/src/games/slots/config";
import { useWalletStore } from "@/src/store/walletStore";
import {
  evaluateLineWins,
  winningCellKeys,
} from "@/src/games/slots/logic/evaluateLineWins";
import { SLOT_REEL_COLS } from "./constants";
import { buildInitialColumns, randomColumns } from "./reelStrip";

type UseSlotPlayfieldStateArgs = {
  theme: SlotThemeConfig;
};

export function useSlotPlayfieldState({ theme }: UseSlotPlayfieldStateArgs) {
  const pool = theme.symbols;
  const minTotalBet = Math.max(1, Math.floor(theme.betting.min));
  const clampedDefaultBet = Math.max(minTotalBet, theme.betting.defaultBet);

  const [spinToken, setSpinToken] = useState(0);
  const [spinning, setSpinning] = useState(false);
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
    // 下注寫入如果失敗，回滾到轉動前盤面，避免玩家看到「有停輪但其實沒下注成功」。
    void wagerPromise.then((ok) => {
      if (ok) return;
      cancelled = true;
      setSpinning(false);
      setColumns(prevColumns);
      setSpinToken((t) => t + 1);
      setSpinError("下注失敗，請稍後再試。");
    });

    setColumns(next);
    setSpinToken((t) => t + 1);
    setSpinning(true);

    // 以最慢一欄的動畫時間當結算時點，確保停輪後才更新結果。
    const maxMs = (1.05 + (SLOT_REEL_COLS - 1) * 0.18) * 1000 + 120;
    window.setTimeout(async () => {
      if (cancelled) return;
      const wagerOk = await wagerPromise;
      if (!wagerOk) return;

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
    columns,
    placeSlotWager,
    pool,
    spinning,
    theme,
    totalBet,
    vacBalance,
  ]);

  const onTotalBetChange = useCallback(
    (next: number) => {
      const clamped = Math.max(minTotalBet, next);
      setTotalBet(Number.isFinite(clamped) ? clamped : clampedDefaultBet);
      setSpinError(undefined);
    },
    [clampedDefaultBet, minTotalBet],
  );

  return {
    pool,
    spinToken,
    spinning,
    totalBet,
    spinError,
    columns,
    vacBalance,
    lastEvaluation,
    highlightKeys,
    runDemoSpin,
    onTotalBetChange,
  };
}
