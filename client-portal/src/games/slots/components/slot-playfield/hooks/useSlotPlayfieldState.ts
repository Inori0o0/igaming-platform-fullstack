"use client";

import { useCallback, useMemo, useState } from "react";
import type { SlotThemeConfig } from "@/src/games/slots/config";
import { useWalletStore } from "@/src/store/walletStore";
import {
  evaluateLineWins,
  winningCellKeys,
} from "@/src/games/slots/logic/evaluateLineWins";
import { SLOT_REEL_COLS, SLOT_REEL_ROWS } from "../utils/constants";
import { buildInitialColumns } from "../utils/reelStrip";
import { randomColumnsForRound } from "@/src/games/slots/logic/rng";

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
    // 立刻鎖住（在任何下注請求送出之前），避免連點在 setSpinning(true) 真正落地前
    // 又通過上面的 `if (spinning) return` 檢查，觸發第二筆下注。
    setSpinning(true);
    const prevColumns = columns;
    // roundId 先產生、再拿去當 RNG 種子：同一 roundId 一定對應同一盤面，結果可重現、可稽核。
    const roundId = crypto.randomUUID();
    const next = randomColumnsForRound(pool, roundId, SLOT_REEL_COLS, SLOT_REEL_ROWS);
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
