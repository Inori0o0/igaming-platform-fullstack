"use client";

import { useParams } from "next/navigation";
import { Card } from "@/src/components/ui/Card";
import { LogoLoader } from "@/src/components/loading/LogoLoader";
import { ProfileOrderDetailView } from "@/src/components/profile/orders/ProfileOrderDetailView";
import { useProfileOrderDetail } from "@/src/components/profile/orders/useProfileOrderDetail";

export default function ProfileOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : "";

  const { user, authLoading, order, loading, error } =
    useProfileOrderDetail(orderId);

  if (authLoading) {
    return (
      <main className="space-y-4">
        <Card title="訂單明細" description="載入中…">
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
        <Card title="訂單明細" description="請登入後查看。">
          <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-sm text-neutral-400">
            請先登入以查看訂單。
          </div>
        </Card>
      </main>
    );
  }

  return (
    <ProfileOrderDetailView order={order} loading={loading} error={error} />
  );
}
