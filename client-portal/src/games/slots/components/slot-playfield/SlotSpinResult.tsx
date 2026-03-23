/**
 * 顯示本局 `evaluateLineWins` 結果：總分、各線符號與倍率（展示用 VAC，未扣真實錢包）。
 */
import type { SlotThemeConfig } from "@/src/games/slots/config";
import type { SpinEvaluation } from "@/src/games/slots/logic/evaluateLineWins";

type SlotSpinResultProps = {
  theme: SlotThemeConfig;
  evaluation: SpinEvaluation;
  spinning: boolean;
};

export function SlotSpinResult({
  theme,
  evaluation,
  spinning,
}: SlotSpinResultProps) {
  const { lineWins, totalCredits, betPerLine } = evaluation;

  return (
    <div
      className={`rounded-2xl border px-3 py-3 text-xs ${theme.visual.reelFrame}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={`font-semibold ${theme.visual.mutedText}`}>
          連線結果
        </span>
        <span className={`text-[11px] ${theme.visual.mutedText}`}>
          總下注 {Math.round(evaluation.totalBet)} · 每線 {Math.round(betPerLine)}
        </span>
      </div>

      {spinning ? (
        <p className={`mt-2 ${theme.visual.mutedText}`}>停輪後更新結算…</p>
      ) : lineWins.length === 0 ? (
        <p className={`mt-2 ${theme.visual.mutedText}`}>本局無連線（3 連以上）。</p>
      ) : (
        <>
          <p className={`mt-2 text-sm font-semibold ${theme.visual.accentText}`}>
            本局合計{" "}
            <span className="tabular-nums">{Math.round(totalCredits)}</span> VAC
          </p>
          <ul className={`mt-2 space-y-1.5 ${theme.visual.mutedText}`}>
            {lineWins.map((w) => {
              const sym = theme.symbols.find((s) => s.id === w.symbolId);
              return (
                <li
                  key={`${w.paylineIndex}-${w.symbolId}-${w.runLength}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/25 px-2 py-1.5"
                >
                  <span>
                    線 {w.paylineIndex + 1} · {sym?.name ?? w.symbolId} ·{" "}
                    {w.runLength} 連
                  </span>
                  <span className={theme.visual.accentText}>
                    ×{w.multiplier} →{" "}
                    <span className="tabular-nums">
                      {Math.round(w.lineWinCredits)}
                    </span>{" "}
                    VAC
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
