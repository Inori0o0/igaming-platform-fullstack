export function formatVac(n: number | string | null | undefined): string {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function orderStatusLabel(s: string): string {
  switch (s) {
    case "paid":
      return "已付款";
    case "created":
      return "建立中";
    case "cancelled":
      return "已取消";
    case "refunded":
      return "已退款";
    default:
      return s;
  }
}

export function fulfillmentLabel(f: string): string {
  return f === "physical" ? "實體" : "虛擬";
}

export function shortOrderId(id: string): string {
  if (id.length <= 13) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}
