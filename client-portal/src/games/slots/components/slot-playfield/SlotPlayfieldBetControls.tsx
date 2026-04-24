import { useState } from "react";
import type { SlotThemeConfig } from "@/src/games/slots/config";

type SlotPlayfieldBetControlsProps = {
  theme: SlotThemeConfig;
  spinning: boolean;
  totalBet: number;
  vacBalance: number;
  onTotalBetChange: (next: number) => void;
};

export function SlotPlayfieldBetControls({
  theme,
  spinning,
  totalBet,
  vacBalance,
  onTotalBetChange,
}: SlotPlayfieldBetControlsProps) {
  const v = theme.visual;
  const minTotalBet = Math.max(1, Math.floor(theme.betting.min));
  const stepOptions = [100, 1000, 10000] as const;
  const cannotAfford = vacBalance < totalBet;
  const [step, setStep] = useState<number>(stepOptions[0]);

  const decDisabled = spinning || totalBet <= minTotalBet;
  const incDisabled = spinning;

  const applyDelta = (delta: number) => {
    // 僅保留最低下注，不設上限。
    const next = Math.max(minTotalBet, totalBet + delta);
    onTotalBetChange(next);
  };

  const applyAllIn = () => {
    // 梭哈 = 目前可用餘額（VAC），僅保留最低下注檢查。
    const next = Math.max(minTotalBet, Math.floor(vacBalance));
    onTotalBetChange(next);
  };

  return (
    <div className="h-full">
      <div className="grid gap-2">
        <label className="space-y-1">
          <span className={`text-[11px] font-semibold ${v.mutedText}`}>總下注（VAC）</span>
          <div className="flex flex-wrap gap-2">
            {stepOptions.map((option) => (
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
            <button
              type="button"
              onClick={applyAllIn}
              disabled={spinning || vacBalance < minTotalBet}
              className="rounded-md border border-amber-300/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-100 transition hover:border-amber-200/70 hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              梭哈
            </button>
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
              <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
                Total Bet
              </p>
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
          <div className="flex items-center justify-between gap-2">
            <p className={`text-[11px] ${v.mutedText}`}>餘額 {Math.round(vacBalance)} VAC</p>
            {cannotAfford ? (
              <p className="text-[11px] font-semibold text-amber-200">餘額不足，無法下注。</p>
            ) : null}
          </div>
        </label>
      </div>
    </div>
  );
}
