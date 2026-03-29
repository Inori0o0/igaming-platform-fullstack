/** 加入購物車回饋文案：庫存／規則類用琥珀色，成功類用青色 */
export function addToCartMessageClassName(message: string): string {
  const warn =
    message.includes("庫存") ||
    message.includes("缺貨") ||
    message.includes("擁有") ||
    message.includes("上限") ||
    message.includes("每款限") ||
    message.includes("清空");
  return warn ? "text-amber-200" : "text-cyan-200";
}
