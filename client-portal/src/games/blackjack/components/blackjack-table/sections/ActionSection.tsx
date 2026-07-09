"use client";

import clsx from "clsx";
import { Button } from "@/src/components/ui/Button";

type ActionSectionProps = {
  isMobile: boolean;
  vacBalance: number;
  bet: number;
  inRound: boolean;
  isBusy: boolean;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canDoSplit: boolean;
  onStartRound: () => void;
  onHit: () => void;
  onStand: () => void;
  onDoubleDown: () => void;
  onSplit: () => void;
};

export function ActionSection({
  isMobile,
  vacBalance,
  bet,
  inRound,
  isBusy,
  canHit,
  canStand,
  canDouble,
  canDoSplit,
  onStartRound,
  onHit,
  onStand,
  onDoubleDown,
  onSplit,
}: ActionSectionProps) {
  return (
    <div
      className={clsx(
        isMobile &&
          "rounded-2xl border border-cyan-400/30 bg-neutral-950/85 p-2 shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-md",
      )}
    >
      <div className={clsx("grid grid-cols-2 gap-2", !isMobile && "sm:gap-2.5")}>
      <Button
        onClick={onStartRound}
        disabled={inRound || isBusy || vacBalance < bet}
        className={clsx(
          "col-span-2 text-sm",
          isMobile ? "min-h-12" : "py-2.5 sm:py-2",
        )}
      >
        開始本局
      </Button>
      <Button
        variant="outline"
        onClick={onHit}
        disabled={!canHit}
        className={clsx(
          "text-sm",
          isMobile ? "min-h-11" : "min-h-10 sm:min-h-9",
        )}
      >
        要牌 Hit
      </Button>
      <Button
        variant="outline"
        onClick={onStand}
        disabled={!canStand}
        className={clsx(
          "text-sm",
          isMobile ? "min-h-11" : "min-h-10 sm:min-h-9",
        )}
      >
        停牌 Stand
      </Button>
      <Button
        variant="outline"
        onClick={onDoubleDown}
        disabled={!canDouble}
        className={clsx(
          "text-sm",
          isMobile ? "min-h-11" : "min-h-10 sm:min-h-9",
        )}
      >
        雙倍 Double
      </Button>
      <Button
        variant="outline"
        onClick={onSplit}
        disabled={!canDoSplit}
        className={clsx(
          "text-sm",
          isMobile ? "min-h-11" : "min-h-10 sm:min-h-9",
        )}
      >
        分牌 Split
      </Button>
      </div>
    </div>
  );
}
