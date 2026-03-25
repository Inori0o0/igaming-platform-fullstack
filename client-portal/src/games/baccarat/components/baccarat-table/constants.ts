/**
 * 下注區間、籌碼與靜態資產路徑、洗牌 RNG（與 Blackjack 共用 provider）。
 */
import { resolveBlackjackRandomProvider } from "@/src/games/blackjack/logic/rng";

export const MIN_BET = 100;
export const MAX_BET = 100000;
export const TABLE_BET_OPTIONS = [100, 500, 1000, 5000] as const;

export const RNG_MODE: "pseudo" | "server-seeded" = "pseudo";
export const randomProvider = resolveBlackjackRandomProvider(RNG_MODE);

export const CHIP_CARD_ASSETS = {
  cardBack: "/games/chip_card/bj_card_back.png",
  chips: {
    100: "/games/chip_card/chip_100.png",
    500: "/games/chip_card/chip_500.png",
    1000: "/games/chip_card/chip_1000.png",
    5000: "/games/chip_card/chip_5000.png",
  },
} as const;

export const BACCARAT_ASSETS = {
  tableBackground: "/games/baccarat/bc_table_bg.png",
  mascot: {
    tralalero: {
      idle: "/games/baccarat/mascot/mascot_tralalero_tralala_idle.png",
      win: "/games/baccarat/mascot/mascot_tralalero_tralala_win.png",
      lose: "/games/baccarat/mascot/mascot_tralalero_tralala_lose.png",
    },
    lirili: {
      idle: "/games/baccarat/mascot/mascot_lirili_larila_idle.png",
      win: "/games/baccarat/mascot/mascot_lirili_larila_win.png",
      lose: "/games/baccarat/mascot/mascot_lirili_larila_lose.png",
    },
    tung: {
      win: "/games/baccarat/mascot/mascot_triplet_win.png",
      tie: "/games/baccarat/mascot/mascot_triplet_tie.png",
    },
  },
} as const;

export const DEAL_ANIMATION_MS = 220;
export const RESULT_MESSAGE_DELAY_MS = 320;

