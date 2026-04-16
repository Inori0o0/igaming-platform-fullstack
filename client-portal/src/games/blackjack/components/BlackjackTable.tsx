"use client";

/**
 * 二十一點頁面主元件：左欄 TableStage、右欄 ControlPanel；狀態由 useBlackjackTableGame 集中管理。
 */
import { MAX_BET, MIN_BET } from "./blackjack-table/constants";
import { tierGroup } from "./blackjack-table/helpers";
import { ControlPanel } from "./blackjack-table/ControlPanel";
import { TableStage } from "./blackjack-table/TableStage";
import { useBlackjackTableGame } from "./blackjack-table/useBlackjackTableGame";

export function BlackjackTable() {
  // Hook 負責遊戲狀態與動作，元件本身只處理畫面。
  const {
    vacBalance,
    bet,
    setBet,
    betStep,
    setBetStep,
    round,
    message,
    eventTone,
    isBusy,
    inRound,
    dealerTotal,
    dealerMood,
    brrTriggered,
    bombardiroTriggered,
    canHit,
    canStand,
    canDouble,
    canDoSplit,
    startRound,
    hit,
    stand,
    doubleDown,
    split,
  } = useBlackjackTableGame();

  const topTier = round?.settled[0]?.handTier;
  const topTierGroup = topTier ? tierGroup(topTier) : "normal";

  return (
    <div className="grid gap-2 pb-[calc(10rem+env(safe-area-inset-bottom))] xl:min-h-[620px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:items-stretch xl:pb-0">
      <TableStage
        round={round}
        dealerTotal={dealerTotal}
        dealerMood={dealerMood}
        brrTriggered={brrTriggered}
        bombardiroTriggered={bombardiroTriggered}
      />
      <ControlPanel
        vacBalance={vacBalance}
        bet={bet}
        betStep={betStep}
        inRound={inRound}
        isBusy={isBusy}
        canHit={canHit}
        canStand={canStand}
        canDouble={canDouble}
        canDoSplit={canDoSplit}
        eventTone={eventTone}
        message={message}
        topTierGroup={topTierGroup}
        topTier={topTier}
        round={round}
        onSelectStep={setBetStep}
        onDecreaseBet={() => setBet((v) => Math.max(MIN_BET, v - betStep))}
        onIncreaseBet={() => setBet((v) => Math.min(MAX_BET, v + betStep))}
        onAllInBet={() =>
          setBet(
            Math.max(MIN_BET, Math.min(MAX_BET, Math.floor(vacBalance))),
          )
        }
        onStartRound={startRound}
        onHit={hit}
        onStand={stand}
        onDoubleDown={doubleDown}
        onSplit={split}
      />
    </div>
  );
}
