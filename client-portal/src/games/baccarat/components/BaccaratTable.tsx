"use client";

/**
 * 百家樂牌桌組裝：左 TableStage、右 ControlPanel；狀態由 useBaccaratTableGame 集中管理。
 */
import { BACCARAT_ASSETS, MIN_BET } from "./baccarat-table/utils/constants";
import { ControlPanel } from "./baccarat-table/sections/ControlPanel";
import { TableStage } from "./baccarat-table/sections/TableStage";
import { useBaccaratTableGame } from "./baccarat-table/hooks/useBaccaratTableGame";
import { useGameImagePreload } from "@/src/hooks/useGameImagePreload";

type BaccaratTableProps = {
  onReady?: () => void;
};

export function BaccaratTable({ onReady }: BaccaratTableProps) {
  useGameImagePreload(BACCARAT_ASSETS.tableBackground, onReady);
  const {
    vacBalance,
    bet,
    setBet,
    betStep,
    setBetStep,
    betArea,
    setBetArea,
    round,
    road,
    message,
    eventTone,
    isBusy,
    inRound,
    advance,
  } = useBaccaratTableGame();

  return (
    <div className="grid gap-2 pb-[calc(8rem+env(safe-area-inset-bottom))] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:pb-0">
      <TableStage round={round} />
      <ControlPanel
        vacBalance={vacBalance}
        bet={bet}
        betStep={betStep}
        betArea={betArea}
        inRound={inRound}
        isBusy={isBusy}
        message={message}
        eventTone={eventTone}
        round={round}
        road={road}
        onSelectStep={setBetStep}
        onSelectBetArea={setBetArea}
        onDecreaseBet={() => setBet((v) => Math.max(MIN_BET, v - betStep))}
        onIncreaseBet={() => setBet((v) => v + betStep)}
        onAllInBet={() =>
          setBet(
            Math.max(MIN_BET, Math.floor(vacBalance)),
          )
        }
        onStartRound={advance}
      />
    </div>
  );
}

