/**
 * 下注區間、籌碼與靜態資產路徑、洗牌 RNG（與 Blackjack 共用 provider）。
 */
import { resolveBlackjackRandomProvider } from "@/src/games/blackjack/logic/rng";
import {
  CHIP_CARD_ASSETS,
  DEFAULT_BET,
  DEFAULT_BET_STEP,
  MAX_BET,
  MIN_BET,
  TABLE_BET_OPTIONS,
} from "@/src/games/table/bettingConstants";
import { httpServerSeedClient } from "@/src/lib/gameSeedClient";

export { CHIP_CARD_ASSETS, DEFAULT_BET, DEFAULT_BET_STEP, MAX_BET, MIN_BET, TABLE_BET_OPTIONS };

/** 洗牌種子改由伺服器核發（見 /api/games/seed），前端不再能自行決定/竄改開局結果。 */
export const RNG_MODE: "pseudo" | "server-seeded" = "server-seeded";
export const randomProvider = resolveBlackjackRandomProvider(RNG_MODE, httpServerSeedClient);

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

