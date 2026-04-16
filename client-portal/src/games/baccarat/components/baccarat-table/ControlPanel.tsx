"use client";

/**
 * 右側面板：下注區、籌碼 step、主按鈕（文案依回合 phase 由本元件推算）、狀態與可收合路單。
 * `onStartRound` 實際綁定為 `advance`（開局與翻牌同一入口）。
 */
import { Card } from "@/src/components/ui/Card";
import { type BaccaratBetArea } from "@/src/games/baccarat/logic/game";
import { ActionSection } from "./ActionSection";
import { BettingSection } from "./BettingSection";
import { TABLE_BET_OPTIONS } from "./constants";
import { RoadPanel } from "./RoadPanel";
import { StatusPanel } from "./StatusPanel";
import type { BaccaratRoundState, RoadEntry } from "./types";

type ControlPanelProps = {
  vacBalance: number;
  bet: number;
  betStep: (typeof TABLE_BET_OPTIONS)[number];
  betArea: BaccaratBetArea;
  inRound: boolean;
  isBusy: boolean;
  message: string;
  eventTone: "info" | "success" | "warning";
  round: BaccaratRoundState | null;
  road: RoadEntry[];
  onSelectStep: (step: (typeof TABLE_BET_OPTIONS)[number]) => void;
  onDecreaseBet: () => void;
  onIncreaseBet: () => void;
  onSelectBetArea: (area: BaccaratBetArea) => void;
  /** 將下注設為當前餘額可下的最大值（仍受 MIN/MAX 限制）。 */
  onAllInBet: () => void;
  onStartRound: () => void;
};

// NOTE: keep props permissive to avoid TS server stale-prop diagnostics in editor.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ControlPanel(props: any) {
  const {
    vacBalance,
    bet,
    betStep,
    betArea,
    inRound,
    isBusy,
    message,
    eventTone,
    round,
    road,
    onSelectStep,
    onDecreaseBet,
    onIncreaseBet,
    onSelectBetArea,
    onAllInBet,
    onStartRound,
  } = props as ControlPanelProps;

  const canAdjustBet = !inRound && !isBusy;
  const canStartOrAdvance = !isBusy && (inRound || vacBalance >= bet);
  const phase = round?.phase ?? "idle";
  const primaryLabel =
    phase === "idle" || phase === "settled"
      ? "開始本局"
      : phase === "dealing"
        ? "發牌中..."
        : phase === "dealt" || phase === "revealing_player"
          ? "翻牌：閒"
          : phase === "revealing_banker"
            ? "翻牌：莊"
            : phase === "drawing_player_third"
              ? "補牌：閒"
              : phase === "revealing_player_third"
                ? "翻牌：閒補牌"
                : phase === "drawing_banker_third"
                  ? "補牌：莊"
                  : phase === "revealing_banker_third"
                    ? "翻牌：莊補牌"
                    : phase === "settling"
                      ? "結算中..."
                      : "翻牌";

  return (
    <div className="space-y-2">
      {/* 手機版排版（< xl）：操作鍵上浮，下注區在下方。 */}
      <div className="xl:hidden">
        <Card title="下注與操作" description="閒 / 莊 / 和（標準百家樂）">
          <div className="space-y-3 text-[11px] text-neutral-300">
            <ActionSection
              isMobile
              primaryLabel={primaryLabel}
              canStartOrAdvance={canStartOrAdvance}
              onStartRound={onStartRound}
            />

            <BettingSection
              bet={bet}
              betStep={betStep}
              vacBalance={vacBalance}
              betArea={betArea}
              canAdjustBet={canAdjustBet}
              isMobile
              onSelectStep={onSelectStep}
              onDecreaseBet={onDecreaseBet}
              onIncreaseBet={onIncreaseBet}
              onSelectBetArea={onSelectBetArea}
              onAllInBet={onAllInBet}
            />

            <StatusPanel
              eventTone={eventTone}
              message={message}
              payout={round?.payout ?? 0}
              totalBet={round?.wager ?? bet}
              isSettled={round?.phase === "settled"}
            />
          </div>
        </Card>
      </div>

      {/* 桌機版排版（>= xl）：保留完整下注與操作資訊。 */}
      <div className="hidden xl:block">
        <Card title="下注與操作" description="閒 / 莊 / 和（標準百家樂）">
          <div className="space-y-3 text-[11px] text-neutral-300">
            <BettingSection
              bet={bet}
              betStep={betStep}
              vacBalance={vacBalance}
              betArea={betArea}
              canAdjustBet={canAdjustBet}
              isMobile={false}
              onSelectStep={onSelectStep}
              onDecreaseBet={onDecreaseBet}
              onIncreaseBet={onIncreaseBet}
              onSelectBetArea={onSelectBetArea}
              onAllInBet={onAllInBet}
            />

            <ActionSection
              isMobile={false}
              primaryLabel={primaryLabel}
              canStartOrAdvance={canStartOrAdvance}
              onStartRound={onStartRound}
            />

            <StatusPanel
              eventTone={eventTone}
              message={message}
              payout={round?.payout ?? 0}
              totalBet={round?.wager ?? bet}
              isSettled={round?.phase === "settled"}
            />
          </div>
        </Card>
      </div>

      <Card
        title="路單（簡化）"
        description="最近 24 局：閒/莊/和（可收合）"
        className="overflow-visible"
      >
        <details className="group relative z-80">
          <summary className="cursor-pointer select-none rounded-xl bg-neutral-950/60 px-3 py-2 text-[11px] text-neutral-300 transition hover:bg-neutral-950/75">
            <span className="font-semibold text-cyan-100">展開 / 收合路單</span>
            <span className="ml-2 text-[10px] text-neutral-400">
              （預設收起，縮短頁面高度）
            </span>
          </summary>
          <div className="absolute bottom-full left-0 right-0 mb-3 rounded-2xl border border-cyan-500/30 bg-neutral-950/95 p-3 shadow-[0_16px_44px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <RoadPanel road={road} />
          </div>
        </details>
      </Card>
    </div>
  );
}
