/**
 * 轉動按鈕：樣式來自 `theme.visual.buttonPrimary*`，與父層 `spinning` 連動鎖定。
 */
import { useState } from "react";
import type { SlotThemeConfig } from "@/src/games/slots/config";

type SlotPlayfieldSpinControlsProps = {
  theme: SlotThemeConfig;
  spinning: boolean;
  onSpin: () => void;
  totalBet: number;
  vacBalance: number;
  onTotalBetChange: (next: number) => void;
  spinError?: string;
};

export function SlotPlayfieldSpinControls({
  theme,
  spinning,
  onSpin,
  totalBet,
  vacBalance,
  onTotalBetChange,
  spinError,
}: SlotPlayfieldSpinControlsProps) {
  const v = theme.visual;
  const cannotAfford = vacBalance < totalBet;
  const MIN_TOTAL_BET = 100;
  const MAX_TOTAL_BET = 100000;
  // 用戶可切換一次加減多少（快速調整下注），預設 100。
  const STEP_OPTIONS = [100, 1000, 10000] as const;
  const [step, setStep] = useState<(typeof STEP_OPTIONS)[number]>(100);
  const decDisabled = spinning || totalBet <= MIN_TOTAL_BET;
  const incDisabled = spinning || totalBet >= MAX_TOTAL_BET;
  const applyDelta = (delta: number) => {
    const next = Math.max(MIN_TOTAL_BET, Math.min(MAX_TOTAL_BET, totalBet + delta));
    onTotalBetChange(next);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-3">
        <label className="space-y-1">
          <span className={`text-[11px] font-semibold ${v.mutedText}`}>總下注（VAC）</span>
          <div className="flex flex-wrap gap-2">
            {STEP_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStep(option)}
                className={`rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wide transition ${
                  step === option
                    ? "border-cyan-200/80 bg-cyan-500/25 text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.45)]"
                    : "border-cyan-500/30 bg-neutral-950/70 text-cyan-200/80 hover:border-cyan-300/60 hover:text-cyan-100"
                }`}
              >
                +{option}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-black/45 p-2 shadow-[0_0_22px_rgba(34,211,238,0.18)]">
            <button
              type="button"
              disabled={decDisabled}
              onClick={() => applyDelta(-step)}
              className="h-11 min-w-11 rounded-lg border border-cyan-300/40 bg-linear-to-b from-cyan-500/40 to-cyan-700/30 px-3 text-lg font-black text-cyan-50 transition hover:scale-[1.04] hover:border-cyan-100/70 hover:shadow-[0_0_16px_rgba(34,211,238,0.55)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              aria-label="降低下注"
            >
              -
            </button>
            <div className="flex-1 rounded-lg border border-white/10 bg-neutral-950/75 px-3 py-2 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">Total Bet</p>
              <p className="mt-0.5 text-lg font-extrabold tabular-nums text-cyan-100">
                {Math.round(totalBet)} VAC
              </p>
            </div>
            <button
              type="button"
              disabled={incDisabled}
              onClick={() => applyDelta(step)}
              className="h-11 min-w-11 rounded-lg border border-fuchsia-300/40 bg-linear-to-b from-fuchsia-500/40 to-fuchsia-700/30 px-3 text-lg font-black text-fuchsia-50 transition hover:scale-[1.04] hover:border-fuchsia-100/70 hover:shadow-[0_0_16px_rgba(217,70,239,0.55)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              aria-label="提高下注"
            >
              +
            </button>
          </div>
          <p className={`text-[11px] ${v.mutedText}`}>
            範圍 {MIN_TOTAL_BET} ~ {MAX_TOTAL_BET} VAC（每次 {step}）
          </p>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSpin}
          disabled={spinning || cannotAfford}
          className={`rounded-full border px-5 py-2 text-xs font-semibold transition disabled:opacity-50 ${v.buttonPrimary} ${v.buttonPrimaryHover}`}
        >
          {spinning ? "轉動中…" : "轉動"}
        </button>
        <p className={`text-[11px] ${v.mutedText}`}>
          餘額 {Math.round(vacBalance)} VAC
        </p>
        {cannotAfford ? (
          <p className="text-[11px] font-semibold text-amber-200">餘額不足，無法下注。</p>
        ) : null}
        {spinError ? (
          <p className="text-[11px] font-semibold text-rose-200">{spinError}</p>
        ) : null}
      </div>
    </div>
  );
}
