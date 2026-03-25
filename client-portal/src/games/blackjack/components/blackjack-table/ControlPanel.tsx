"use client";

/**
 * 右側面板：餘額、下注步進、開局／Hit／Stand／Double／Split 與 StatusPanel、角色說明卡。
 */
import clsx from "clsx";
import Image from "next/image";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { CHIP_CARD_ASSETS, TABLE_BET_OPTIONS } from "./constants";
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
    onStartRound,
    onHit,
    onStand,
    onDoubleDown,
    onSplit,
  } = props;

  return (
    <div className="space-y-2">
      <Card title="操作區" description="標準玩法：Hit / Stand / Double / Split">
        <div className="space-y-3 text-[11px] text-neutral-300">
          <div className="rounded-xl border border-cyan-500/15 bg-neutral-950/70 px-3 py-2">
            <p className="text-neutral-400">下注金額 (VAC)</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TABLE_BET_OPTIONS.map((option) => (
                <button
                  key={option}
                  disabled={inRound || isBusy}
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
              <Button size="sm" variant="ghost" disabled={inRound || isBusy} onClick={onDecreaseBet}>
                -
              </Button>
              <span className="text-cyan-100">{bet}</span>
              <Button size="sm" variant="ghost" disabled={inRound || isBusy} onClick={onIncreaseBet}>
                +
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <Button
              onClick={onStartRound}
              disabled={inRound || isBusy || vacBalance < bet}
              className="col-span-2 py-2.5 text-sm sm:py-2"
            >
              開始本局
            </Button>
            <Button variant="outline" onClick={onHit} disabled={!canHit} className="min-h-10 text-sm sm:min-h-9">
              要牌 Hit
            </Button>
            <Button
              variant="outline"
              onClick={onStand}
              disabled={!canStand}
              className="min-h-10 text-sm sm:min-h-9"
            >
              停牌 Stand
            </Button>
            <Button
              variant="outline"
              onClick={onDoubleDown}
              disabled={!canDouble}
              className="min-h-10 text-sm sm:min-h-9"
            >
              雙倍 Double
            </Button>
            <Button variant="outline" onClick={onSplit} disabled={!canDoSplit} className="min-h-10 text-sm sm:min-h-9">
              分牌 Split
            </Button>
          </div>

          <StatusPanel
            eventTone={eventTone}
            message={message}
            topTierGroup={topTierGroup}
            topTier={topTier}
            round={round}
          />
        </div>
      </Card>

      <Card title="角色演出（強化版）" description="（可收合）以輕動畫 + 事件提示對應 Brainrot 角色。">
        <details className="group">
          <summary className="cursor-pointer select-none rounded-xl bg-neutral-950/60 px-3 py-2 text-[11px] text-neutral-300 transition hover:bg-neutral-950/75">
            <span className="font-semibold text-cyan-100">展開 / 收合角色說明</span>
            <span className="ml-2 text-[10px] text-neutral-400">（預設收起，縮短頁面高度）</span>
          </summary>
          <div className="mt-3">
            <ul className="list-disc space-y-1 pl-5 text-[11px] text-neutral-300">
              <li>Tung Tung Tung Sahur：開局發牌、補牌與結算提示。</li>
              <li>Brr Brr Patapim：Blackjack、爆牌、連勝提示。</li>
              <li>Bombardiro Crocodilo：高額贏面事件提示。</li>
              <li>Elefanto Cactuso：籌碼區與牌桌守護意象（文案預留）。</li>
            </ul>
          </div>
        </details>
      </Card>
    </div>
  );
}
