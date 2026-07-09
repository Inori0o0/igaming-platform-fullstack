/**
 * 下注區間、籌碼與靜態資產路徑、洗牌 RNG（與 Blackjack 共用 provider）。
 */
import { resolveBlackjackRandomProvider } from "@/src/games/blackjack/logic/rng";
import { httpServerSeedClient } from "@/src/lib/gameSeedClient";

export const MIN_BET = 100;
export const MAX_BET = 100000;
export const TABLE_BET_OPTIONS = [100, 500, 1000, 5000] as const;

/** 洗牌種子改由伺服器核發（見 /api/games/seed），前端不再能自行決定/竄改開局結果。 */
export const RNG_MODE: "pseudo" | "server-seeded" = "server-seeded";
export const randomProvider = resolveBlackjackRandomProvider(RNG_MODE, httpServerSeedClient);

export const CHIP_CARD_ASSETS = {
  cardBack: "/games/chip_card/bj_card_back.webp",
  chips: {
    100: "/games/chip_card/chip_100.webp",
    500: "/games/chip_card/chip_500.webp",
    1000: "/games/chip_card/chip_1000.webp",
    5000: "/games/chip_card/chip_5000.webp",
  },
} as const;

export const BACCARAT_ASSETS = {
  tableBackground: "/games/baccarat/bc_table_bg.webp",
  mascot: {
    tralalero: {
      idle: "/games/baccarat/mascot/mascot_tralalero_tralala_idle.webp",
      win: "/games/baccarat/mascot/mascot_tralalero_tralala_win.webp",
      lose: "/games/baccarat/mascot/mascot_tralalero_tralala_lose.webp",
    },
    lirili: {
      idle: "/games/baccarat/mascot/mascot_lirili_larila_idle.webp",
      win: "/games/baccarat/mascot/mascot_lirili_larila_win.webp",
      lose: "/games/baccarat/mascot/mascot_lirili_larila_lose.webp",
    },
    tung: {
      win: "/games/baccarat/mascot/mascot_triplet_win.webp",
      tie: "/games/baccarat/mascot/mascot_triplet_tie.webp",
    },
  },
} as const;

export const DEAL_ANIMATION_MS = 220;
export const RESULT_MESSAGE_DELAY_MS = 320;

