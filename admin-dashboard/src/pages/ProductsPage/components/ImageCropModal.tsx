import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface Props {
  open: boolean
  imageSrc: string | null
  onConfirm: (croppedBlob: Blob) => void
  onCancel: () => void
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context unavailable')

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
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('canvas toBlob failed'))),
      'image/webp',
      0.9,
    )
  })
}

export function ImageCropModal({ open, imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [confirming, setConfirming] = useState(false)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setConfirming(true)
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels)
      onConfirm(blob)
    } finally {
      setConfirming(false)
    }
  }

  // Reset state when modal opens
  if (!open) return null

  return (
    <Modal open={open} onClose={onCancel} title="裁切商品圖片" size="md" zIndex={60}>
      <div className="flex flex-col gap-4 p-5">
        {/* Crop area */}
        <div
          className="relative w-full rounded-lg overflow-hidden"
          style={{ height: '340px', background: '#000' }}
        >
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: '8px' },
                cropAreaStyle: {
                  border: '2px solid var(--color-gold)',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                },
              }}
            />
          )}
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted shrink-0">縮放</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-gold cursor-pointer"
            style={{ accentColor: 'var(--color-gold)' }}
          />
          <span className="text-xs text-text-muted w-8 text-right shrink-0">
            {zoom.toFixed(1)}x
          </span>
        </div>

        <p className="text-xs text-text-muted text-center">
          拖移調整位置・滾輪或拉桿縮放・輸出為 1:1 WebP
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="md" onClick={onCancel} disabled={confirming}>
            取消
          </Button>
          <Button size="md" loading={confirming} onClick={() => void handleConfirm()}>
            確認裁切
          </Button>
        </div>
      </div>
    </Modal>
  )
}
