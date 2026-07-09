/**
 * Supabase 的 numeric 欄位常以字串回傳，這裡統一轉為 number 供前端計算／顯示使用。
 * 錢包與 Profile 歷史紀錄都各自維護過一份相同實作，這裡收斂成單一共用工具。
 */
export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
