"use client";

import { Card } from "@/src/components/ui/Card";
import { LogoLoader } from "@/src/components/loading/LogoLoader";
import { ProfileOrdersBody } from "@/src/components/profile/orders/ProfileOrdersBody";
import { useProfileOrders } from "@/src/components/profile/orders/useProfileOrders";

export default function ProfileOrdersPage() {
  const {
    user,
    authLoading,
    orders,
    loading,
    error,
    retry,
    copiedId,
    copyOrderId,
  } = useProfileOrders();

  if (authLoading) {
    return (
      <main className="space-y-4">
        <Card title="訂單歷史" description="載入中…">
          <div className="flex min-h-28 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-8">
            <LogoLoader size="md" className="text-cyan-300" />
          </div>
        </Card>
      </main>
    );
  }

  if (!user || user.is_guest) {
    return (
      <main className="space-y-4">
        <Card
          title="訂單歷史"
          description="登入後可查看商店訂單與明細。"
        >
          <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-sm text-neutral-400">
            請先登入以查看訂單。
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <Card
        title="訂單歷史"
        description="依建立時間由新到舊排列；點選可查看明細與收件資訊。"
      >
        <ProfileOrdersBody
          orders={orders}
          loading={loading}
          error={error}
          onRetry={retry}
          copiedId={copiedId}
          onCopyOrderId={copyOrderId}
        />
      </Card>
    </main>
  );
}
