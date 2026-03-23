/**
 * 連線結果存成「第幾欄、第幾列」字串鍵；此函式把某一欄對應到的列號集合取出，供該欄 ReelColumn 畫圈。
 */
export function highlightRowsForColumn(
  col: number,
  cellKeys: ReadonlySet<string>,
): Set<number> {
  const rows = new Set<number>();
  for (const key of cellKeys) {
    const parts = key.split(",");
    const c = Number(parts[0]);
    const r = Number(parts[1]);
    if (c === col && Number.isFinite(r)) rows.add(r);
  }
  return rows;
}
