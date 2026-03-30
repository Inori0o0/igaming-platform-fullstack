"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import type { AvatarProductOption } from "@/src/components/profile/useProfileAvatarEditor";

type ProfileShopAvatarCardProps = {
  avatarProducts: AvatarProductOption[];
  equippedAvatarProductId: string | null;
  onSelectAvatar: (productId: string, isUnlocked: boolean) => Promise<void>;
};

export function ProfileShopAvatarCard({
  avatarProducts,
  equippedAvatarProductId,
  onSelectAvatar,
}: ProfileShopAvatarCardProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    if (!equippedAvatarProductId) return null;
    return avatarProducts.find((p) => p.productId === equippedAvatarProductId) ?? null;
  }, [avatarProducts, equippedAvatarProductId]);

  return (
    <Card
      title="商店頭像（未解鎖鎖定）"
      description="點擊查看並切換（未解鎖會鎖住）。"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {selected ? (
            <div className="relative overflow-hidden rounded-full border border-cyan-500/20 bg-neutral-950/60">
              <Image
                src={selected.imageSrc}
                alt={selected.name}
                width={56}
                height={56}
                className="h-14 w-14 object-cover aspect-square"
              />
            </div>
          ) : (
            <div className="h-14 w-14 rounded-full border border-dashed border-cyan-500/20 bg-neutral-950/60" />
          )}
          <div className="text-xs text-neutral-300">
            <p className="font-semibold text-neutral-100">
              {selected ? selected.name : "尚未使用商店頭像"}
            </p>
            <p className="text-neutral-400">
              點擊按鈕查看並切換
            </p>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          切換頭像
        </Button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="切換商店頭像">
        {avatarProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-4 text-xs text-neutral-400">
            尚無可用頭像商品。
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {avatarProducts.map((p) => {
              const isSelected = p.productId === equippedAvatarProductId;
              return (
                <button
                  key={p.productId}
                  type="button"
                  onClick={async () => {
                    if (!p.isUnlocked) return;
                    await onSelectAvatar(p.productId, p.isUnlocked);
                    setOpen(false);
                  }}
                  disabled={!p.isUnlocked}
                  className={[
                    "relative overflow-hidden rounded-full border bg-neutral-950/60 transition",
                    p.isUnlocked
                      ? "border-cyan-500/15 hover:border-cyan-400/35"
                      : "border-neutral-700/40 opacity-70 cursor-not-allowed",
                    isSelected
                      ? "border-cyan-400/70 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
                      : "",
                  ].join(" ")}
                  aria-label={`${p.name} ${p.isUnlocked ? "可選" : "未解鎖"}`}
                >
                  <Image
                    src={p.imageSrc}
                    alt={p.name}
                    width={96}
                    height={96}
                    className="aspect-square h-full w-full object-cover"
                  />
                  {!p.isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-neutral-950/75">
                      <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-100">
                        未解鎖
                      </span>
                    </div>
                  )}
                  {p.isUnlocked && isSelected && (
                    <div className="absolute right-1.5 top-1.5 rounded-full bg-cyan-500/90 px-2 py-0.5 text-[10px] font-semibold text-black">
                      已選擇
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Modal>
    </Card>
  );
}

