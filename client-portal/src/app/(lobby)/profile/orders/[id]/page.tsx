"use client";

import { useParams } from "next/navigation";
import { ProfileOrderDetailView } from "@/src/components/profile/orders/ProfileOrderDetailView";
import { ProfileLoadingCard } from "@/src/components/profile/overview/ProfileLoadingCard";
import { ProfileGuestGate } from "@/src/components/profile/shared/ProfileGuestGate";
import { useProfileOrderDetail } from "@/src/components/profile/orders/useProfileOrderDetail";

export default function ProfileOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : "";

  const { user, authLoading, order, loading, error } =
    useProfileOrderDetail(orderId);

  if (authLoading) {
    return <ProfileLoadingCard title="訂單明細" description="載入中…" />;
  }

  if (!user || user.is_guest) {
    return (
      <ProfileGuestGate
        title="訂單明細"
        description="請登入後查看。"
        message="請先登入以查看訂單。"
      />
    );
  }

  return (
    <ProfileOrderDetailView order={order} loading={loading} error={error} />
  );
}
