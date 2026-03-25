"use client";

/**
 * 百家樂牌桌組裝：左 TableStage、右 ControlPanel；狀態由 useBaccaratTableGame 集中管理。
 */
import { MAX_BET, MIN_BET } from "./baccarat-table/constants";
import { ControlPanel } from "./baccarat-table/ControlPanel";
import { TableStage } from "./baccarat-table/TableStage";
import { useBaccaratTableGame } from "./baccarat-table/useBaccaratTableGame";

export function BaccaratTable() {
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
    <div className="grid gap-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
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
        onIncreaseBet={() => setBet((v) => Math.min(MAX_BET, v + betStep))}
        onStartRound={advance}
      />
    </div>
  );
}

