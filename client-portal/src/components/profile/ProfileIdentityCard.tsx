"use client";

import { useState } from "react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { ProfileAvatarEditorModal } from "@/src/components/profile/ProfileAvatarEditorModal";
import type { AvatarProductOption } from "@/src/components/profile/useProfileAvatarEditor";

type ProfileIdentityCardProps = {
  previewAvatarUrl: string | null;
  fallbackName: string;
  nameDraft: string;
  setNameDraft: (value: string) => void;
  savingName: boolean;
  uploading: boolean;
  onSaveName: () => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
  onClearCustomAvatar: () => Promise<void>;
  onRestoreGoogleAvatar: () => Promise<void>;
  hasCustomAvatar: boolean;
  avatarProducts: AvatarProductOption[];
  equippedAvatarProductId: string | null;
  onSelectShopAvatar: (productId: string, isUnlocked: boolean) => Promise<void>;
};

export function ProfileIdentityCard({
  previewAvatarUrl,
  fallbackName,
  nameDraft,
  setNameDraft,
  savingName,
  uploading,
  onSaveName,
  onUploadFile,
  onClearCustomAvatar,
  onRestoreGoogleAvatar,
  hasCustomAvatar,
  avatarProducts,
  equippedAvatarProductId,
  onSelectShopAvatar,
}: ProfileIdentityCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  const remainingShopAvatars = avatarProducts.filter(
    (p) => !equippedAvatarProductId || p.productId !== equippedAvatarProductId,
  );

  return (
    <Card className="h-full">
      {/* 這塊用固定上限寬度 + 居中，避免在雙欄布局時把右側統計卡擠壓變形。 */}
      <div className="flex h-full w-full flex-col items-center justify-center gap-8 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
        <div className="flex w-full flex-col items-center justify-center gap-3 sm:max-w-[320px]">
          <Avatar
            src={previewAvatarUrl ?? undefined}
            fallback={fallbackName}
            size="lg"
            sizes="128px"
            loading="eager"
            className="h-32 w-32"
          />
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setEditOpen(true)}
            className="w-full"
          >
            編輯頭像
          </Button>
        </div>
        <div className="w-full sm:max-w-[420px]">
          <div className="grid w-full gap-4">
            <Input
              label="顯示名稱"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="text-base"
            />
            <Button
              onClick={() => void onSaveName()}
              disabled={savingName || !nameDraft.trim()}
              className="w-full"
              size="lg"
            >
              {savingName ? "儲存中…" : "儲存"}
            </Button>
          </div>
        </div>
      </div>
      <ProfileAvatarEditorModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        previewAvatarUrl={previewAvatarUrl}
        fallbackName={fallbackName}
        hasCustomAvatar={hasCustomAvatar}
        uploading={uploading}
        remainingShopAvatars={remainingShopAvatars}
        onUploadFile={onUploadFile}
        onClearCustomAvatar={onClearCustomAvatar}
        onRestoreGoogleAvatar={onRestoreGoogleAvatar}
        hasEquippedShopAvatar={Boolean(equippedAvatarProductId)}
        onSelectShopAvatar={onSelectShopAvatar}
      />
    </Card>
  );
}
