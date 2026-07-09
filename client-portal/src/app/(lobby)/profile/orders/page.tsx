"use client";

import { Card } from "@/src/components/ui/Card";
import { ProfileOrdersBody } from "@/src/components/profile/orders/ProfileOrdersBody";
import { ProfileLoadingCard } from "@/src/components/profile/overview/ProfileLoadingCard";
import { ProfileGuestGate } from "@/src/components/profile/shared/ProfileGuestGate";
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
    return <ProfileLoadingCard title="訂單歷史" description="載入中…" />;
  }

  if (!user || user.is_guest) {
    return (
      <ProfileGuestGate
        title="訂單歷史"
        description="登入後可查看商店訂單與明細。"
        message="請先登入以查看訂單。"
      />
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
