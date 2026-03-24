/**
 * 下注區間、籌碼 step、靜態資產路徑、動畫毫秒、RNG 單例（constants 匯出避免多處建立 provider）。
 */
import { resolveBlackjackRandomProvider } from "@/src/games/blackjack/logic/rng";

export const MIN_BET = 100;
export const MAX_BET = 100000;
export const TABLE_BET_OPTIONS = [100, 500, 1000, 5000] as const;
export const RNG_MODE: "pseudo" | "server-seeded" = "pseudo";
export const randomProvider = resolveBlackjackRandomProvider(RNG_MODE);

export const BLACKJACK_ASSETS = {
  tableBackground: "/games/blackjack/bj_table_bg.png",
  dealer: {
    idle: "/games/blackjack/dealer/dealer_triplet_idle.png",
    win: "/games/blackjack/dealer/dealer_triplet_win.png",
    lose: "/games/blackjack/dealer/dealer_triplet_lose.png",
  },
  mascot: {
    brrIdle: "/games/blackjack/mascot/mascot_brr_idle.png",
    brrTriggered: "/games/blackjack/mascot/mascot_brr_triggered.png",
    brrInjured: "/games/blackjack/mascot/mascot_brr_injured.png",
    bombardiroIdle: "/games/blackjack/mascot/mascot_bombardiro_idle.png",
    bombardiroTriggered: "/games/blackjack/mascot/mascot_bombardiro_triggered.png",
  },
} as const;

export const CHIP_CARD_ASSETS = {
  cardBack: "/games/chip_card/bj_card_back.png",
  chips: {
    100: "/games/chip_card/chip_100.png",
    500: "/games/chip_card/chip_500.png",
    1000: "/games/chip_card/chip_1000.png",
    5000: "/games/chip_card/chip_5000.png",
  },
} as const;

export const DEAL_ANIMATION_MS = 220;
export const RESULT_MESSAGE_DELAY_MS = 320;

/** Bombardiro win dash: slower fly toward Brr Brr, then return (ms). */
export const BOMBARDIRO_WIN_DASH_MS = 1400;
