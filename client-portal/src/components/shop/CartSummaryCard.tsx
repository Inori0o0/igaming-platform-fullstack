import { Card } from "@/src/components/ui/Card";

type Summary = {
  subtotalVac: number;
  shippingVac: number;
  discountVac: number;
  totalVac: number;
};

type CartSummaryCardProps = {
  summary: Summary;
};

export function CartSummaryCard({ summary }: CartSummaryCardProps) {
  return (
    <Card title="金額" description="含運費與優惠券折扣。">
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
          <span className="text-cyan-200">{summary.totalVac.toLocaleString()} VAC</span>
        </div>
      </div>
    </Card>
  );
}
