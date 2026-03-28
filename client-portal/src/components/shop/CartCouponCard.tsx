import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";

type CouponState = {
  code: string;
  description: string;
} | null;

type CartCouponCardProps = {
  couponInput: string;
  onCouponInputChange: (value: string) => void;
  coupon: CouponState;
  couponMessage: string | null;
  onApply: () => void;
  onClear: () => void;
};

export function CartCouponCard({
  couponInput,
  onCouponInputChange,
  coupon,
  couponMessage,
  onApply,
  onClear,
}: CartCouponCardProps) {
  return (
    <Card title="優惠券" description="可先用 VAC10 或 SHIP60。">
      <div className="space-y-3 rounded-2xl border border-cyan-500/20 bg-neutral-950/60 p-4 text-xs text-neutral-300">
        <input
          value={couponInput}
          onChange={(event) => onCouponInputChange(event.target.value)}
          className="w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-cyan-400/60"
          placeholder="輸入優惠碼"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={onApply}>
            套用
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear}>
            清除
          </Button>
        </div>
        {coupon && (
          <p className="text-cyan-200">
            已套用：{coupon.code}（{coupon.description}）
          </p>
        )}
        {couponMessage && <p className="text-neutral-400">{couponMessage}</p>}
      </div>
    </Card>
  );
}
