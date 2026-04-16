"use client";

/**
 * 右側面板：餘額、下注步進、開局／Hit／Stand／Double／Split 與 StatusPanel、角色說明卡。
 */
import { Card } from "@/src/components/ui/Card";
import { ActionSection } from "./ActionSection";
import { BettingSection } from "./BettingSection";
import { TABLE_BET_OPTIONS } from "./constants";
import { StatusPanel } from "./StatusPanel";
import type { RoundState } from "./types";

type ControlPanelProps = {
  vacBalance: number;
  bet: number;
  betStep: (typeof TABLE_BET_OPTIONS)[number];
  inRound: boolean;
  isBusy: boolean;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canDoSplit: boolean;
  eventTone: "info" | "success" | "warning";
  message: string;
  topTierGroup: "five-cards" | "twenty-one" | "normal";
  topTier?: RoundState["settled"][number]["handTier"];
  round: RoundState | null;
  onSelectStep: (step: (typeof TABLE_BET_OPTIONS)[number]) => void;
  onDecreaseBet: () => void;
  onIncreaseBet: () => void;
  /** 將下注設為當前餘額可下的最大值（仍受 MIN/MAX 限制）。 */
  onAllInBet: () => void;
  onStartRound: () => void;
  onHit: () => void;
  onStand: () => void;
  onDoubleDown: () => void;
  onSplit: () => void;
};

export function ControlPanel(props: ControlPanelProps) {
  const {
    vacBalance,
    bet,
    betStep,
    inRound,
    isBusy,
    canHit,
    canStand,
    canDouble,
    canDoSplit,
    eventTone,
    message,
    topTierGroup,
    topTier,
    round,
    onSelectStep,
    onDecreaseBet,
    onIncreaseBet,
    onAllInBet,
    onStartRound,
    onHit,
    onStand,
    onDoubleDown,
    onSplit,
  } = props;

  return (
    <div className="space-y-2">
      {/* 手機版排版（< xl）：操作鍵上浮，下注區在下方。 */}
      <div className="xl:hidden">
        <Card
          title="操作區"
          description="標準玩法：Hit / Stand / Double / Split"
        >
          <div className="space-y-3 text-[11px] text-neutral-300">
            <ActionSection
              isMobile
              vacBalance={vacBalance}
              bet={bet}
              inRound={inRound}
              isBusy={isBusy}
              canHit={canHit}
              canStand={canStand}
              canDouble={canDouble}
              canDoSplit={canDoSplit}
              onStartRound={onStartRound}
              onHit={onHit}
              onStand={onStand}
              onDoubleDown={onDoubleDown}
              onSplit={onSplit}
            />

            <BettingSection
              bet={bet}
              betStep={betStep}
              vacBalance={vacBalance}
              inRound={inRound}
              isBusy={isBusy}
              isMobile
              onSelectStep={onSelectStep}
              onDecreaseBet={onDecreaseBet}
              onIncreaseBet={onIncreaseBet}
              onAllInBet={onAllInBet}
            />

            <StatusPanel
              eventTone={eventTone}
              message={message}
              topTierGroup={topTierGroup}
              topTier={topTier}
              round={round}
            />
          </div>
        </Card>
      </div>

      {/* 桌機版排版（>= xl）：保留完整操作區塊。 */}
      <div className="hidden xl:block">
        <Card
          title="操作區"
          description="標準玩法：Hit / Stand / Double / Split"
        >
          <div className="space-y-3 text-[11px] text-neutral-300">
            <BettingSection
              bet={bet}
              betStep={betStep}
              vacBalance={vacBalance}
              inRound={inRound}
              isBusy={isBusy}
              isMobile={false}
              onSelectStep={onSelectStep}
              onDecreaseBet={onDecreaseBet}
              onIncreaseBet={onIncreaseBet}
              onAllInBet={onAllInBet}
            />

            <ActionSection
              isMobile={false}
              vacBalance={vacBalance}
              bet={bet}
              inRound={inRound}
              isBusy={isBusy}
              canHit={canHit}
              canStand={canStand}
              canDouble={canDouble}
              canDoSplit={canDoSplit}
              onStartRound={onStartRound}
              onHit={onHit}
              onStand={onStand}
              onDoubleDown={onDoubleDown}
              onSplit={onSplit}
            />

            <StatusPanel
              eventTone={eventTone}
              message={message}
              topTierGroup={topTierGroup}
              topTier={topTier}
              round={round}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
