/**
 * 前端「一局」快照：RoundState 含牌堆殘量、莊家牌、玩家多手、階段與結算後派彩。
 * MascotCue 驅動邊緣吉祥物（贏／輸）動畫，與莊家 mood 分開。
 */
import type {
  BlackjackCard,
  HandSettlement,
  PlayerHand,
  RoundPhase,
} from "@/src/games/blackjack/logic/types";

export type RoundState = {
  roundId: string;
  deck: BlackjackCard[];
  dealerCards: BlackjackCard[];
  hands: PlayerHand[];
  activeHandIndex: number;
  phase: RoundPhase;
  totalBet: number;
  settled: HandSettlement[];
  payout: number;
  streak: number;
};

export type MascotCue = "none" | "win" | "lose";
