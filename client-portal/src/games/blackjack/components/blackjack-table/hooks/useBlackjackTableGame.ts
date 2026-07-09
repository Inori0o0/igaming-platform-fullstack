/**
 * 牌桌唯一對外 hook：聚合下注狀態、RoundState、訊息與吉祥物 cue，
 * 並把「玩家操作」交給 useRoundActions、「莊家補牌與派彩」交給 useRoundSettlement。
 */
import { useMemo, useState } from "react";
import { useWalletStore } from "@/src/store/walletStore";
import { DEFAULT_BET, DEFAULT_BET_STEP, TABLE_BET_OPTIONS } from "../utils/constants";
import { dealerVisibleTotal } from "../utils/helpers";
import type { MascotCue, RoundState } from "../utils/types";
import { useRoundActions } from "./useRoundActions";
import { useRoundSettlement } from "./useRoundSettlement";

export function useBlackjackTableGame() {
  const vacBalance = useWalletStore((s) => s.balances.VAC);
  const placeBlackjackWager = useWalletStore((s) => s.placeBlackjackWager);
  const applyBlackjackPayout = useWalletStore((s) => s.applyBlackjackPayout);
  const [bet, setBet] = useState(DEFAULT_BET);
  const [betStep, setBetStep] = useState<(typeof TABLE_BET_OPTIONS)[number]>(DEFAULT_BET_STEP);
  const [round, setRound] = useState<RoundState | null>(null);
  const [message, setMessage] = useState("請先下注後開始本局。");
  const [eventTone, setEventTone] = useState<"info" | "success" | "warning">("info");
  const [mascotCue, setMascotCue] = useState<MascotCue>("none");
  const [isBusy, setIsBusy] = useState(false);

  const dealerTotal = useMemo(() => {
    if (!round) return 0;
    return dealerVisibleTotal({ roundPhase: round.phase, dealerCards: round.dealerCards });
  }, [round]);

  const dealerMood = useMemo(() => {
    if (!round || round.phase !== "settled") return "idle" as const;
    const anyPositive = round.settled.some((s) => s.net > 0);
    return anyPositive ? ("lose" as const) : ("win" as const);
  }, [round]);

  const brrTriggered = mascotCue === "lose";
  const bombardiroTriggered = mascotCue === "win";

  const { settleRound } = useRoundSettlement({
    setRound,
    setMessage,
    setEventTone,
    setMascotCue,
    setIsBusy,
    applyBlackjackPayout,
  });

  const {
    inRound: inRoundFlag,
    canHit,
    canStand,
    canDouble,
    canDoSplit,
    startRound,
    hit,
    stand,
    doubleDown,
    split,
  } = useRoundActions({
    bet,
    isBusy,
    vacBalance,
    round,
    setRound,
    setMessage,
    setEventTone,
    setMascotCue,
    setIsBusy,
    placeBlackjackWager,
    applyBlackjackPayout,
    settleRound,
  });

  return {
    vacBalance,
    bet,
    setBet,
    betStep,
    setBetStep,
    round,
    message,
    eventTone,
    isBusy,
    inRound: inRoundFlag,
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
  };
}
