/**
 * 下注區間、籌碼 step、靜態資產路徑、動畫毫秒、RNG 單例（constants 匯出避免多處建立 provider）。
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

export const BLACKJACK_ASSETS = {
  tableBackground: "/games/blackjack/bj_table_bg.webp",
  dealer: {
    idle: "/games/blackjack/dealer/dealer_triplet_idle.webp",
    win: "/games/blackjack/dealer/dealer_triplet_win.webp",
    lose: "/games/blackjack/dealer/dealer_triplet_lose.webp",
  },
  mascot: {
    brrIdle: "/games/blackjack/mascot/mascot_brr_idle.webp",
    brrTriggered: "/games/blackjack/mascot/mascot_brr_triggered.webp",
    brrInjured: "/games/blackjack/mascot/mascot_brr_injured.webp",
    bombardiroIdle: "/games/blackjack/mascot/mascot_bombardiro_idle.webp",
    bombardiroTriggered: "/games/blackjack/mascot/mascot_bombardiro_triggered.webp",
  },
} as const;

export const DEAL_ANIMATION_MS = 220;
export const RESULT_MESSAGE_DELAY_MS = 320;

/** Bombardiro win dash: slower fly toward Brr Brr, then return (ms). */
export const BOMBARDIRO_WIN_DASH_MS = 1400;
