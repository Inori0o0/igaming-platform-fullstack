"use client";

import { ProfileStatsCard } from "@/src/components/profile/overview/ProfileStatsCard";
import { ProfileIdentityCard } from "@/src/components/profile/overview/ProfileIdentityCard";
import { ProfileFeedbackToast } from "@/src/components/profile/shared/ProfileFeedbackToast";
import { ProfileLoadingCard } from "@/src/components/profile/overview/ProfileLoadingCard";
import { ProfileGuestGate } from "@/src/components/profile/shared/ProfileGuestGate";
import { useProfileOverviewViewModel } from "@/src/components/profile/overview/useProfileOverviewViewModel";

export default function ProfileOverviewPage() {
  const vm = useProfileOverviewViewModel();

  if (vm.authLoading || vm.profileLoading) {
    return (
      <ProfileLoadingCard title="個人資料" description="載入中…" variant="dashed" />
    );
  }

  if (!vm.user || vm.user.is_guest) {
    return (
      <ProfileGuestGate
        title="登入後才能使用"
        description="個人資料（顯示名稱、頭像）僅限已登入用戶。"
        message="你目前使用的是「訪客模式」。點擊下方按鈕登入即可開始設定。"
        onLogin={() => vm.setOpenAuthModal(true)}
        layout="row"
      />
    );
  }

  return (
    <main className="space-y-4">
      <div className="pointer-events-none fixed right-4 top-16 z-50 flex flex-col gap-2">
        {vm.toast && (
          <ProfileFeedbackToast
            tone={vm.toast.tone}
            message={vm.toast.message}
          />
        )}
      </div>
      <div className="rounded-2xl border border-cyan-500/20 bg-neutral-950/55 p-4 shadow-[0_0_40px_rgba(34,211,238,0.10)] flex items-center">
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="min-w-0 flex-1 lg:basis-3/5">
            <ProfileIdentityCard
              previewAvatarUrl={vm.previewAvatarUrl}
              fallbackName={vm.nameDraft || vm.user.display_name || "U"}
              nameDraft={vm.nameDraft}
              setNameDraft={vm.setNameDraft}
              savingName={vm.savingName}
              uploading={vm.uploading}
              hasCustomAvatar={Boolean(vm.customAvatarUrl)}
              onSaveName={vm.onSaveName}
              onUploadFile={vm.onUploadFile}
              onClearCustomAvatar={vm.onClearCustomAvatar}
              onRestoreGoogleAvatar={vm.onRestoreGoogleAvatar}
              avatarProducts={vm.avatarProducts}
              equippedAvatarProductId={vm.equippedAvatarProductId}
              onSelectShopAvatar={vm.onSelectShopAvatar}
            />
          </div>

          <div className="min-w-0 flex-1 lg:basis-2/5">
            <ProfileStatsCard
              vacBalance={vm.balances.VAC}
              plays={vm.stats.plays}
              totalWin={vm.stats.totalWin}
              ordersLoading={vm.ordersLoading}
              ordersCount={vm.ordersCount}
            />
          </div>
        </div>
      </div>
      {vm.profileError && (
        <p className="text-xs text-rose-300">{vm.profileError}</p>
      )}
    </main>
  );
}
