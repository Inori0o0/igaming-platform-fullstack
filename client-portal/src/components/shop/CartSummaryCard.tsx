import type { ReactNode } from "react";
import { Card } from "@/src/components/ui/Card";

type Summary = {
  subtotalVac: number;
  shippingVac: number;
  discountVac: number;
  totalVac: number;
};

type CartSummaryCardProps = {
  summary: Summary;
  /** 例如全寬結帳按鈕，放在 Total 下方最顯眼處 */
  footer?: ReactNode;
};

export function CartSummaryCard({ summary, footer }: CartSummaryCardProps) {
  return (
    <Card title="金額" description="含運費與折扣。">
      <div className="space-y-2 text-xs text-neutral-300">
        <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
          <span>Subtotal</span>
          <span className="text-cyan-200">{summary.subtotalVac.toLocaleString()} VAC</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
          <span>Shipping</span>
          <span className="text-cyan-200">{summary.shippingVac.toLocaleString()} VAC</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
          <span>Discount</span>
          <span className="text-cyan-200">-{summary.discountVac.toLocaleString()} VAC</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
          <span>Total</span>
          <span className="text-lg font-semibold tabular-nums text-cyan-100">
            {summary.totalVac.toLocaleString()} VAC
          </span>
        </div>
      </div>
      {footer ? (
        <div className="mt-4 border-t border-cyan-500/20 pt-4">{footer}</div>
      ) : null}
    </Card>
  );
}
