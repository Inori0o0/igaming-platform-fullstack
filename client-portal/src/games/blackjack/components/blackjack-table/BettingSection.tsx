"use client";

import clsx from "clsx";
import Image from "next/image";
import { Button } from "@/src/components/ui/Button";
import { CHIP_CARD_ASSETS, MIN_BET, TABLE_BET_OPTIONS } from "./constants";

type BettingSectionProps = {
  bet: number;
  betStep: (typeof TABLE_BET_OPTIONS)[number];
  vacBalance: number;
  inRound: boolean;
  isBusy: boolean;
  isMobile: boolean;
  onSelectStep: (step: (typeof TABLE_BET_OPTIONS)[number]) => void;
  onDecreaseBet: () => void;
  onIncreaseBet: () => void;
  onAllInBet: () => void;
};

export function BettingSection({
  bet,
  betStep,
  vacBalance,
  inRound,
  isBusy,
  isMobile,
  onSelectStep,
  onDecreaseBet,
  onIncreaseBet,
  onAllInBet,
}: BettingSectionProps) {
  return (
    <div className="rounded-xl border border-cyan-500/15 bg-neutral-950/70 px-3 py-2">
      <p className="text-neutral-400">下注金額 (VAC)</p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {TABLE_BET_OPTIONS.map((option) => (
          <button
            key={option}
            disabled={inRound || isBusy}
            onClick={() => onSelectStep(option)}
            className={clsx(
              "flex flex-col items-center justify-center gap-1 rounded-xl border py-2 transition",
              betStep === option
                ? "border-cyan-300/70 bg-cyan-500/10"
                : "border-cyan-500/20 bg-neutral-950/70 hover:border-cyan-400/40",
              "disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            <span
              className={clsx(
                "relative shrink-0",
                isMobile ? "h-7 w-7" : "h-8 w-8",
              )}
            >
              <Image
                src={CHIP_CARD_ASSETS.chips[option]}
                alt={`chip ${option}`}
                fill
                sizes={isMobile ? "28px" : "32px"}
                className="object-contain"
              />
            </span>
            <span className="text-[11px] font-semibold tabular-nums text-cyan-100">
              {option}
            </span>
          </button>
        ))}
        <button
          type="button"
          disabled={inRound || isBusy || vacBalance < MIN_BET}
          onClick={onAllInBet}
          className="flex flex-col items-center justify-center rounded-xl border border-amber-300/40 bg-amber-500/15 py-2 text-[11px] font-bold text-amber-100 transition hover:border-amber-200/70 hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          梭哈
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={inRound || isBusy}
          onClick={onDecreaseBet}
        >
          -
        </Button>
        <span className="text-cyan-100">{bet}</span>
        <Button
          size="sm"
          variant="ghost"
          disabled={inRound || isBusy}
          onClick={onIncreaseBet}
        >
          +
        </Button>
        <span className="ml-auto text-[10px] text-neutral-400">餘額 {vacBalance}</span>
      </div>
    </div>
  );
}
