import { ShoppingBag, Package, Truck, Tag, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useOrderDetail } from "../hooks/useOrderDetail";
import {
  STATUS_LABEL,
  STATUS_VARIANT,
  EDITABLE_STATUS_OPTIONS,
} from "../hooks/useOrders";
import type { DbOrder } from "@/types";

interface Props {
  order: DbOrder | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
}

function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
      <span className="text-text-muted">{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-text-muted w-20 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-xs text-text-primary flex-1 text-right min-w-0 wrap-break-word">
        {children}
      </span>
    </div>
  );
}

export function OrderDetailModal({
  order,
  open,
  onClose,
  onUpdateStatus,
}: Props) {
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
  } = useOrderDetail(open && order ? order.id : null);

  if (!order) return null;

  const isPhysical = order.fulfillment_type === "physical";
  const shippingInfo = order.shipping_snapshot as Record<
    string,
    unknown
  > | null;

  return (
    <Modal open={open} onClose={onClose} title="訂單詳情" size="lg">
      <div className="flex flex-col gap-4 px-5 py-5">
        {/* Order ID */}
        <p className="text-xs font-mono text-text-muted -mt-1">{order.id}</p>

        {/* Basic info */}
        <div
          className="rounded-lg border border-border overflow-hidden"
          style={{ background: "var(--color-surface-elevated)" }}
        >
          <SectionHeader icon={<Package size={13} />} label="基本資訊" />
          <div className="px-4">
            <InfoRow label="用戶 ID">
              <span className="font-mono text-[11px]">{order.user_id}</span>
            </InfoRow>
            <InfoRow label="配送方式">
              <Badge variant="default">{order.fulfillment_type ?? "—"}</Badge>
            </InfoRow>
            {order.coupon_code && (
              <InfoRow label="優惠券">
                <div className="flex items-center gap-1 justify-end">
                  <Tag size={11} className="text-gold" />
                  <Badge variant="info">{order.coupon_code}</Badge>
                </div>
              </InfoRow>
            )}
            <InfoRow label="建立時間">{formatDate(order.created_at)}</InfoRow>
            <InfoRow label="更新時間">{formatDate(order.updated_at)}</InfoRow>
            <div className="flex items-center gap-3 py-2.5">
              <span className="text-xs text-text-muted w-20 shrink-0">
                訂單狀態
              </span>
              <div className="flex-1 flex items-center justify-end gap-2">
                <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </Badge>
                <Select
                  options={EDITABLE_STATUS_OPTIONS}
                  value={order.status}
                  onChange={(e) => {
                    if (e.target.value !== order.status) void onUpdateStatus(order.id, e.target.value)
                  }}
                  className="text-xs py-1 h-auto w-28"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping info (physical only) */}
        {isPhysical && shippingInfo && (
          <div
            className="rounded-lg border border-border overflow-hidden"
            style={{ background: "var(--color-surface-elevated)" }}
          >
            <SectionHeader icon={<Truck size={13} />} label="配送資訊" />
            <div className="px-4">
              {Object.entries(shippingInfo).map(([key, val]) => (
                <InfoRow key={key} label={key}>
                  {String(val ?? "—")}
                </InfoRow>
              ))}
            </div>
          </div>
        )}

        {/* Order items */}
        <div
          className="rounded-lg border border-border overflow-hidden"
          style={{ background: "var(--color-surface-elevated)" }}
        >
          <SectionHeader icon={<ShoppingBag size={13} />} label="訂購商品" />
          {itemsLoading ? (
            <div className="flex flex-col divide-y divide-border">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded bg-border animate-pulse shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-3 rounded bg-border animate-pulse w-32" />
                    <div className="h-2.5 rounded bg-border animate-pulse w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : itemsError ? (
            <p className="px-4 py-4 text-xs text-danger">{itemsError}</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-4 text-xs text-text-muted text-center">
              無商品紀錄
            </p>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {item.products?.image_url ? (
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-10 h-10 rounded object-cover shrink-0"
                      style={{ border: "1px solid var(--color-border)" }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded shrink-0 flex items-center justify-center text-base"
                      style={{ background: "var(--color-border)" }}
                    >
                      {item.products?.is_avatar ? "👤" : "📦"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.products?.name ?? "已刪除商品"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {item.size_snapshot && (
                        <span className="text-xs text-text-muted">
                          尺寸：{item.size_snapshot}
                        </span>
                      )}
                      <span className="text-xs text-text-muted">
                        × {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gold">
                      {formatCurrency(
                        item.line_total_vac ??
                          item.price_at_purchase * item.quantity,
                      )}
                    </p>
                    {item.unit_price_vac != null && (
                      <p className="text-xs text-text-muted">
                        單價 {formatCurrency(item.unit_price_vac)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Amount breakdown */}
        <div
          className="rounded-lg border border-border overflow-hidden"
          style={{ background: "var(--color-surface-elevated)" }}
        >
          <SectionHeader icon={<User size={13} />} label="金額明細" />
          <div className="px-4">
            {order.subtotal_vac != null && (
              <InfoRow label="小計">
                <span className="text-text-secondary">
                  {formatCurrency(order.subtotal_vac)}
                </span>
              </InfoRow>
            )}
            {order.discount_vac != null && order.discount_vac > 0 && (
              <InfoRow label="折扣">
                <span className="text-success">
                  − {formatCurrency(order.discount_vac)}
                </span>
              </InfoRow>
            )}
            {order.shipping_fee_vac != null && (
              <InfoRow label="運費">
                <span className="text-text-secondary">
                  {formatCurrency(order.shipping_fee_vac)}
                </span>
              </InfoRow>
            )}
            <InfoRow label="總計">
              <span className="text-base font-bold text-gold">
                {formatCurrency(order.total_vac ?? order.total_amount)}
              </span>
            </InfoRow>
          </div>
        </div>
      </div>
    </Modal>
  );
}
