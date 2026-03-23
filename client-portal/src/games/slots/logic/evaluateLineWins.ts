/**
 * 連線獎勵計算：依主題 paylines 逐條檢查「由左而右」連續相同符號，
 * 對照 paytable 取得倍率，再乘上「每線分攤下注」得到本局分數。
 */
import type { PaytableEntry, SlotSymbol, SlotThemeConfig } from "@/src/games/slots/config";

export type LineWin = {
  paylineIndex: number;
  symbolId: string;
  runLength: number;
  multiplier: number;
  /** multiplier ×（每線分攤後下注） */
  lineWinCredits: number;
};

export type SpinEvaluation = {
  lineWins: LineWin[];
  totalCredits: number;
  betPerLine: number;
  totalBet: number;
};

export type SpinBetConfig = {
  totalBet: number;
};

/** 從該 payline 上五顆符號，數「從最左邊開始連續幾顆相同」（中斷即停）。 */
function leftRunFromLine(symbols: readonly SlotSymbol[]): {
  symbolId: string;
  length: number;
} {
  if (symbols.length === 0) return { symbolId: "", length: 0 };
  const firstId = symbols[0]!.id;
  let length = 1;
  for (let i = 1; i < symbols.length; i++) {
    if (symbols[i]!.id === firstId) length++;
    else break;
  }
  return { symbolId: firstId, length };
}

function multiplierFor(
  paytable: readonly PaytableEntry[],
  symbolId: string,
  count: 3 | 4 | 5,
): number | undefined {
  return paytable.find((e) => e.symbolId === symbolId && e.count === count)
    ?.multiplier;
}

/**
 * 由左至右連續相同符號；3/4/5 連線對照 paytable。
 * `betConfig` 可由 UI 控制總下注（`totalBet`），線數固定使用主題 payline 全部條目。
 */
export function evaluateLineWins(
  columns: readonly (readonly SlotSymbol[])[],
  theme: SlotThemeConfig,
  betConfig?: Partial<SpinBetConfig>,
): SpinEvaluation {
  // lines 固定採用主題全部 paylines；本版僅允許外部控制 totalBet。
  const activePaylineCount = Math.max(1, theme.paylines.length);
  const totalBetInput = betConfig?.totalBet ?? theme.betting.defaultBet;
  const totalBet = Math.max(theme.betting.min, Math.min(totalBetInput, theme.betting.max));
  const betPerLine = totalBet / activePaylineCount;

  const lineWins: LineWin[] = [];

  theme.paylines.slice(0, activePaylineCount).forEach((line, paylineIndex) => {
    const symbols = line.map((row, col) => columns[col]![row]!);
    const run = leftRunFromLine(symbols);
    if (run.length < 3) return;

    const count = run.length as 3 | 4 | 5;
    const mul = multiplierFor(theme.paytable, run.symbolId, count);
    if (mul === undefined) return;

    lineWins.push({
      paylineIndex,
      symbolId: run.symbolId,
      runLength: run.length,
      multiplier: mul,
      lineWinCredits: mul * betPerLine,
    });
  });

  const totalCredits = lineWins.reduce((s, w) => s + w.lineWinCredits, 0);

  return { lineWins, totalCredits, betPerLine, totalBet };
}

/**
 * 供轉輪高亮：把每條中獎線「有算進獎勵的前 runLength 格」轉成 key `col,row`。
 * （僅標記連線段，與 evaluateLineWins 的左起連續長度一致。）
 */
export function winningCellKeys(lineWins: readonly LineWin[], theme: SlotThemeConfig): Set<string> {
  const keys = new Set<string>();
  for (const w of lineWins) {
    const line = theme.paylines[w.paylineIndex];
    if (!line) continue;
    for (let c = 0; c < w.runLength; c++) {
      const row = line[c];
      if (row === undefined) continue;
      keys.add(`${c},${row}`);
    }
  }
  return keys;
}
