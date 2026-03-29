import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import type { CouponFulfillmentScope, CouponState } from "@/src/store/cartStore";

type CartCouponCardProps = {
  couponInput: string;
  onCouponInputChange: (value: string) => void;
  coupon: CouponState | null;
  couponMessage: string | null;
  onApply: () => void;
  onClear: () => void;
  /** 有商品時顯示目前為實體／虛擬車 */
  cartMode: "physical" | "digital" | null;
};

function scopeShortLabel(scope: CouponFulfillmentScope): string {
  if (scope === "any") return "通用";
  if (scope === "physical") return "實體";
  return "虛擬";
}

export function CartCouponCard({
  couponInput,
  onCouponInputChange,
  coupon,
  couponMessage,
  onApply,
  onClear,
  cartMode,
}: CartCouponCardProps) {
  return (
    <Card title="優惠券">
      <div className="space-y-3 rounded-2xl border border-cyan-500/20 bg-neutral-950/60 p-4 text-xs text-neutral-300">
        <p className="text-[11px] leading-relaxed text-neutral-500">
          <span className="text-neutral-400">實體</span> SHIPFREE 免運 ·{" "}
          <span className="text-neutral-400">虛擬</span> DIGI97 97折 ·{" "}
          <span className="text-neutral-400">通用</span> ALL95 95折
        </p>
        {cartMode ? (
          <p className="text-[11px] text-neutral-500">
            購物車：{cartMode === "physical" ? "實體" : "虛擬"}
          </p>
        ) : null}
        <input
          value={couponInput}
          onChange={(event) => onCouponInputChange(event.target.value)}
          className="w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2.5 font-mono text-xs uppercase tracking-wide text-neutral-100 outline-none placeholder:text-neutral-600 placeholder:normal-case placeholder:tracking-normal focus:border-cyan-400/60"
          placeholder="優惠碼"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" type="button" onClick={onApply}>
            套用
          </Button>
          <Button size="sm" type="button" variant="ghost" onClick={onClear}>
            清除
          </Button>
        </div>
        {coupon ? (
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-3 py-2">
            <p className="font-mono text-sm font-medium tracking-wide text-cyan-100/95">
              {coupon.code}
            </p>
            <p className="mt-0.5 text-[11px] text-cyan-200/75">
              {coupon.description} · {scopeShortLabel(coupon.appliesFulfillment)}
            </p>
          </div>
        ) : null}
        {couponMessage ? (
          <p className={couponMessage.startsWith("已套用") ? "text-cyan-200/90" : "text-amber-200/90"}>
            {couponMessage}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
