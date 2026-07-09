"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";

type ProfileAvatarCropModalProps = {
  open: boolean;
  imageSrc: string | null;
  onConfirm: (croppedBlob: Blob) => void | Promise<void>;
  onCancel: () => void;
};

/** 依 pixel crop 從圖片裁出區域並輸出 1:1 WebP（與後台上傳商品圖邏輯一致） */
async function getCroppedWebpBlob(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas context unavailable");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("canvas toBlob failed")),
      "image/webp",
      0.9,
    );
  });
}

export function ProfileAvatarCropModal({
  open,
  imageSrc,
  onConfirm,
  onCancel,
}: ProfileAvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [confirming, setConfirming] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setConfirming(true);
    try {
      const blob = await getCroppedWebpBlob(imageSrc, croppedAreaPixels);
      await onConfirm(blob);
    } finally {
      setConfirming(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="裁切頭像"
      overlayZClass="z-[60]"
      shellClassName="max-h-[90vh] w-full max-w-lg px-4"
    >
      <div className="flex flex-col gap-4 py-1">
        <div
          className="relative w-full overflow-hidden rounded-lg bg-black"
          style={{ height: "340px" }}
        >
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: "8px" },
                cropAreaStyle: {
                  border: "2px solid rgb(34 211 238)",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
                },
              }}
            />
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-neutral-400">縮放</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 cursor-pointer accent-cyan-400"
          />
          <span className="w-8 shrink-0 text-right text-xs text-neutral-400">
            {zoom.toFixed(1)}x
          </span>
        </div>

        <p className="text-center text-xs text-neutral-400">
          拖移調整位置・滾輪或拉桿縮放・輸出為 1:1 WebP
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={confirming}
          >
            取消
          </Button>
          <Button
            size="md"
            onClick={() => void handleConfirm()}
            disabled={confirming || !imageSrc}
          >
            {confirming ? "處理中…" : "確認裁切"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
