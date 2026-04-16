"use client";

import { Button } from "@/src/components/ui/Button";

type ActionSectionProps = {
  isMobile: boolean;
  primaryLabel: string;
  canStartOrAdvance: boolean;
  onStartRound: () => void;
};

export function ActionSection({
  isMobile,
  primaryLabel,
  canStartOrAdvance,
  onStartRound,
}: ActionSectionProps) {
  if (isMobile) {
    return (
      <div className="sticky bottom-2 z-30 mt-2 rounded-2xl border border-cyan-400/30 bg-neutral-950/90 p-2 shadow-[0_14px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <div className="pb-[calc(env(safe-area-inset-bottom)+0.2rem)]">
          <Button
            onClick={onStartRound}
            disabled={!canStartOrAdvance}
            className="min-h-12 w-full text-sm"
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={onStartRound}
      disabled={!canStartOrAdvance}
      className="w-full py-2.5 text-sm"
    >
      {primaryLabel}
    </Button>
  );
}
