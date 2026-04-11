"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { ProfileAvatarCropModal } from "@/src/components/profile/ProfileAvatarCropModal";
import type { AvatarProductOption } from "@/src/components/profile/useProfileAvatarEditor";

type ProfileAvatarEditorModalProps = {
  open: boolean;
  onClose: () => void;
  previewAvatarUrl: string | null;
  fallbackName: string;
  hasCustomAvatar: boolean;
  hasEquippedShopAvatar: boolean;
  uploading: boolean;
  remainingShopAvatars: AvatarProductOption[];
  onUploadFile: (file: File) => Promise<void>;
  onClearCustomAvatar: () => Promise<void>;
  onRestoreGoogleAvatar: () => Promise<void>;
  onSelectShopAvatar: (productId: string, isUnlocked: boolean) => Promise<void>;
};

export function ProfileAvatarEditorModal({
  open,
  onClose,
  previewAvatarUrl,
  fallbackName,
  hasCustomAvatar,
  hasEquippedShopAvatar,
  uploading,
  remainingShopAvatars,
  onUploadFile,
  onClearCustomAvatar,
  onRestoreGoogleAvatar,
  onSelectShopAvatar,
}: ProfileAvatarEditorModalProps) {
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

  const handleEditorClose = useCallback(() => {
    setCropImageSrc(null);
    onClose();
  }, [onClose]);

  // 目前頭像 + 上傳頭像固定佔 2 格；超過兩排時才開捲動避免 modal 過高。
  const shouldScroll = remainingShopAvatars.length >= 5;

  return (
    <>
    <Modal
      open={open}
      onClose={handleEditorClose}
      title="編輯頭像"
      closeOnEscape={!cropImageSrc}
    >
      <div className="space-y-4">
        {(hasCustomAvatar || hasEquippedShopAvatar) && (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              onClick={async () => {
                await onClearCustomAvatar();
                handleEditorClose();
              }}
              disabled={!hasCustomAvatar}
            >
              刪除自傳（回退）
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await onRestoreGoogleAvatar();
                handleEditorClose();
              }}
            >
              改用 Google 頭像
            </Button>
          </div>
        )}

        <div
          className={
            shouldScroll ? "max-h-[220px] overflow-y-auto pr-1" : undefined
          }
        >
          <div className="grid grid-cols-3 gap-3 justify-items-center">
            <div className="flex h-24 w-24 items-center justify-center">
              <Avatar
                src={previewAvatarUrl ?? undefined}
                fallback={fallbackName}
                size="lg"
                sizes="96px"
                className="h-24 w-24"
              />
            </div>

            <div className="flex h-24 w-24 items-center justify-center">
              <div
                role="button"
                tabIndex={0}
                className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border border-dashed border-cyan-500/40 bg-neutral-950/60 text-center transition hover:border-cyan-400/60"
                aria-label="上傳頭像"
                onClick={() => {
                  const el = document.getElementById(
                    "profile-avatar-upload-input",
                  ) as HTMLInputElement | null;
                  el?.click();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const el = document.getElementById(
                      "profile-avatar-upload-input",
                    ) as HTMLInputElement | null;
                    el?.click();
                  }
                }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                  上傳頭像
                </span>
              </div>
            </div>

            {remainingShopAvatars.length === 0 ? (
              <div className="col-span-3 flex items-center justify-center rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 px-4 py-5 text-xs text-neutral-400">
                目前沒有其它商店頭像可顯示。
              </div>
            ) : (
              remainingShopAvatars.map((p) => (
                <div
                  key={p.productId}
                  className="relative flex h-24 w-24 items-center justify-center"
                >
                  <button
                    type="button"
                    className={[
                      "relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full transition",
                      p.isUnlocked
                        ? "hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]"
                        : "cursor-not-allowed opacity-80",
                    ].join(" ")}
                    disabled={!p.isUnlocked}
                    aria-label={`${p.name} ${p.isUnlocked ? "可選" : "未解鎖"}`}
                    onClick={async () => {
                      await onSelectShopAvatar(p.productId, p.isUnlocked);
                      handleEditorClose();
                    }}
                  >
                    <Avatar
                      src={p.imageSrc}
                      fallback={p.name}
                      size="lg"
                      sizes="96px"
                      className="h-24 w-24 border border-transparent"
                    />
                  </button>

                  {!p.isUnlocked && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-neutral-950/70">
                      <span className="rounded-full bg-neutral-950/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-100">
                        未解鎖
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <input
          id="profile-avatar-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const inputEl = e.currentTarget;
            const file = e.target.files?.[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            setCropImageSrc(url);
            inputEl.value = "";
          }}
          disabled={uploading}
        />
      </div>
    </Modal>

    <ProfileAvatarCropModal
      key={cropImageSrc ?? "profile-avatar-crop"}
      open={open && Boolean(cropImageSrc)}
      imageSrc={cropImageSrc}
      onCancel={() => setCropImageSrc(null)}
        onConfirm={async (blob) => {
          const file = new File([blob], `avatar-${crypto.randomUUID()}.webp`, {
            type: "image/webp",
          });
          await onUploadFile(file);
          handleEditorClose();
        }}
    />
    </>
  );
}

