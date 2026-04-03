import { useRef } from 'react'
import { Upload, ImageIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { useProductForm } from '../hooks/useProductForm'

type Props = ReturnType<typeof useProductForm>

const CATEGORY_OPTIONS = [
  { value: 'digital', label: '數位商品' },
  { value: 'apparel', label: '服飾' },
  { value: 'collectible', label: '收藏品' },
]

const FULFILLMENT_OPTIONS = [
  { value: 'digital', label: '數位配送' },
  { value: 'physical', label: '實體配送' },
]

function ToggleField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  hint?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {hint && <p className="text-xs text-text-muted mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0"
        style={{ background: checked ? 'var(--color-gold)' : 'var(--color-border)' }}
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  )
}

export function ProductModal({
  open,
  editingProduct,
  values,
  imagePreview,
  submitting,
  errors,
  close,
  handleNameChange,
  handleCategoryChange,
  handleImageChange,
  setValues,
  submit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEdit = !!editingProduct
  const globalError = (errors as Record<string, string>)['_global']

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? `編輯商品：${editingProduct?.name}` : '新增商品'}
      size="lg"
    >
      <div className="p-5 flex flex-col gap-5">
        {globalError && (
          <div className="rounded-md px-4 py-2.5 text-sm text-danger bg-danger-muted border border-danger">
            {globalError}
          </div>
        )}

        {/* 圖片上傳 */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-text-secondary">
            商品圖片{!isEdit && <span className="text-danger ml-1">*</span>}
          </p>
          <div
            className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
            style={{
              borderColor: errors.image ? 'var(--color-danger)' : 'var(--color-border)',
              background: 'var(--color-surface-elevated)',
              minHeight: '120px',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="preview"
                  className="max-h-40 max-w-full rounded object-contain"
                />
                <p className="text-xs text-text-muted">點擊更換圖片</p>
              </>
            ) : (
              <>
                <ImageIcon size={32} className="text-text-muted" />
                <div className="text-center">
                  <p className="text-sm font-medium text-text-secondary">點擊上傳圖片</p>
                  <p className="text-xs text-text-muted mt-0.5">支援 PNG、JPG、WEBP</p>
                </div>
                <Button variant="secondary" size="sm" type="button">
                  <Upload size={14} />選擇檔案
                </Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleImageChange(file)
                e.target.value = ''
              }}
            />
          </div>
          {errors.image && <p className="text-xs text-danger">{errors.image}</p>}
        </div>

        {/* 基本資料 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="商品名稱 *"
              value={values.name}
              onChange={e => handleNameChange(e.target.value)}
              error={errors.name}
              placeholder="e.g. vAcAnt Logo Tee"
            />
          </div>
          <Input
            label="Slug（URL 識別碼）*"
            value={values.slug}
            onChange={e => setValues(prev => ({ ...prev, slug: e.target.value }))}
            error={errors.slug}
            placeholder="e.g. vacant-logo-tee"
          />
          <Input
            label="VAC 售價 *"
            type="number"
            min={0}
            value={values.price_vac}
            onChange={e => setValues(prev => ({ ...prev, price_vac: e.target.value }))}
            error={errors.price_vac}
            placeholder="0"
          />
        </div>

        {/* 描述 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">商品描述</label>
          <textarea
            value={values.description}
            onChange={e => setValues(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            placeholder="商品說明文字..."
            className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none"
          />
        </div>

        {/* 分類與配送 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="分類"
            value={values.category}
            options={CATEGORY_OPTIONS}
            onChange={e => handleCategoryChange(e.target.value as Parameters<typeof handleCategoryChange>[0])}
          />
          <Select
            label="配送方式"
            value={values.fulfillment_type}
            options={FULFILLMENT_OPTIONS}
            onChange={e =>
              setValues(prev => ({
                ...prev,
                fulfillment_type: e.target.value as 'physical' | 'digital',
              }))
            }
          />
        </div>

        {/* 排序 */}
        <Input
          label="排序權重（數字越小越前面）"
          type="number"
          min={0}
          value={values.sort_order}
          onChange={e => setValues(prev => ({ ...prev, sort_order: e.target.value }))}
          className="w-32"
        />

        {/* 切換開關群組 */}
        <div
          className="rounded-lg border border-border flex flex-col divide-y divide-border"
          style={{ background: 'var(--color-surface-elevated)' }}
        >
          <div className="px-4 py-3">
            <ToggleField
              label="上架狀態"
              hint="關閉後商品不會顯示在前台"
              checked={values.is_active}
              onChange={v => setValues(prev => ({ ...prev, is_active: v }))}
            />
          </div>
          <div className="px-4 py-3">
            <ToggleField
              label="強制售罄"
              hint="即使有庫存，仍顯示為售罄"
              checked={values.force_sold_out}
              onChange={v => setValues(prev => ({ ...prev, force_sold_out: v }))}
            />
          </div>
          {values.category === 'digital' && (
            <div className="px-4 py-3">
              <ToggleField
                label="頭像商品"
                hint="購買後可在個人中心設為頭像"
                checked={values.is_avatar}
                onChange={v => setValues(prev => ({ ...prev, is_avatar: v }))}
              />
            </div>
          )}
        </div>

        {/* 動作按鈕 */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="md" onClick={close} disabled={submitting}>
            取消
          </Button>
          <Button size="md" loading={submitting} onClick={() => void submit()}>
            {isEdit ? '儲存變更' : '建立商品'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
