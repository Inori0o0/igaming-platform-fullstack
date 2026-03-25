"use client";

/**
 * 右側面板：下注區、籌碼 step、主按鈕（文案依回合 phase 由本元件推算）、狀態與可收合路單。
 * `onStartRound` 實際綁定為 `advance`（開局與翻牌同一入口）。
 */
import clsx from "clsx";
import Image from "next/image";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { BACCARAT_PAYOUT, type BaccaratBetArea } from "@/src/games/baccarat/logic/game";
import { CHIP_CARD_ASSETS, TABLE_BET_OPTIONS } from "./constants";
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
  onStartRound: () => void;
};

const AREA_LABEL: Record<BaccaratBetArea, string> = {
  player: "閒 Player",
  banker: "莊 Banker",
  tie: "和 Tie",
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
      <Card title="下注與操作" description="閒 / 莊 / 和（標準百家樂）">
        <div className="space-y-3 text-[11px] text-neutral-300">
          <div className="rounded-xl border border-cyan-500/15 bg-neutral-950/70 px-3 py-2">
            <p className="text-neutral-400">下注區</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(AREA_LABEL) as BaccaratBetArea[]).map((area) => (
                <button
                  key={area}
                  disabled={!canAdjustBet}
                  onClick={() => onSelectBetArea(area)}
                  className={clsx(
                    "rounded-xl border px-2 py-2 text-left transition",
                    betArea === area
                      ? "border-cyan-300/70 bg-cyan-500/10 text-cyan-100"
                      : "border-cyan-500/20 bg-neutral-950/70 hover:border-cyan-400/40",
                    "disabled:cursor-not-allowed disabled:opacity-45",
                  )}
                >
                  <p className="text-[11px] font-semibold">{AREA_LABEL[area]}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    派彩 x {BACCARAT_PAYOUT[area]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/15 bg-neutral-950/70 px-3 py-2">
            <p className="text-neutral-400">下注金額 (VAC)</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TABLE_BET_OPTIONS.map((option) => (
                <button
                  key={option}
                  disabled={!canAdjustBet}
                  onClick={() => onSelectStep(option)}
                  className={clsx(
                    "group relative flex items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition",
                    betStep === option
                      ? "border-cyan-300/70 bg-cyan-500/10"
                      : "border-cyan-500/20 bg-neutral-950/70 hover:border-cyan-400/40",
                    "disabled:cursor-not-allowed disabled:opacity-45",
                  )}
                >
                  <span className="relative h-9 w-9 shrink-0">
                    <Image
                      src={CHIP_CARD_ASSETS.chips[option]}
                      alt={`chip ${option}`}
                      fill
                      sizes="36px"
                      className="object-contain"
                    />
                  </span>
                  <span className="text-xs font-semibold text-cyan-100">{option}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" variant="ghost" disabled={!canAdjustBet} onClick={onDecreaseBet}>
                -
              </Button>
              <span className="text-cyan-100">{bet}</span>
              <Button size="sm" variant="ghost" disabled={!canAdjustBet} onClick={onIncreaseBet}>
                +
              </Button>
              <span className="ml-auto text-[10px] text-neutral-400">餘額 {vacBalance}</span>
            </div>
          </div>

          <Button onClick={onStartRound} disabled={!canStartOrAdvance} className="w-full py-2.5 text-sm">
            {primaryLabel}
          </Button>

          <StatusPanel
            eventTone={eventTone}
            message={message}
            payout={round?.payout ?? 0}
            totalBet={round?.wager ?? bet}
            isSettled={round?.phase === "settled"}
          />
        </div>
      </Card>

      <Card title="路單（簡化）" description="最近 24 局：閒/莊/和（可收合）">
        <details className="group">
          <summary className="cursor-pointer select-none rounded-xl bg-neutral-950/60 px-3 py-2 text-[11px] text-neutral-300 transition hover:bg-neutral-950/75">
            <span className="font-semibold text-cyan-100">展開 / 收合路單</span>
            <span className="ml-2 text-[10px] text-neutral-400">（預設收起，縮短頁面高度）</span>
          </summary>
          <div className="mt-3">
            <RoadPanel road={road} />
          </div>
        </details>
      </Card>
    </div>
  );
}

