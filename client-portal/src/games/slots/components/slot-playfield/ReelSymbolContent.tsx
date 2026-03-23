/**
 * 單一格子內容：有 `imageSrc` 則顯示圖（限制最大高度以免爆格），否則顯示 `display` 文字。
 */
import Image from "next/image";
import type { SlotSymbol } from "@/src/games/slots/config";

type ReelSymbolContentProps = {
  sym: SlotSymbol;
  /** 無圖時套用在文字上的 className */
  textClassName: string;
  /** 與單格高度連動，避免小格塞大圖 */
  symbolMaxPx?: number;
};

export function ReelSymbolContent({
  sym,
  textClassName,
  symbolMaxPx,
}: ReelSymbolContentProps) {
  if (sym.imageSrc) {
    const cap = symbolMaxPx ?? 88;
    return (
      <Image
        src={sym.imageSrc}
        alt={sym.name}
        width={128}
        height={128}
        className="w-auto max-w-[92%] object-contain select-none"
        style={{ maxHeight: cap }}
        draggable={false}
      />
    );
  }
  return <span className={textClassName}>{sym.display}</span>;
}
