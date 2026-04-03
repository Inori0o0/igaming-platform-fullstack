import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { DbCoupon } from '@/types'
import type { CouponFormValues } from '../hooks/useCoupons'

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percentage', label: '百分比折扣（%）' },
  { value: 'fixed', label: '固定金額折扣（VAC）' },
  { value: 'free_shipping', label: '免運費' },
]

const FULFILLMENT_OPTIONS = [
  { value: 'any', label: '全部訂單' },
  { value: 'physical', label: '實體配送' },
  { value: 'digital', label: '數位配送' },
]

function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
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

interface Props {
  open: boolean
  editingCoupon: DbCoupon | null
  values: CouponFormValues
  setValues: React.Dispatch<React.SetStateAction<CouponFormValues>>
  submitting: boolean
  errors: Partial<Record<keyof CouponFormValues | '_global', string>>
  close: () => void
  submit: () => Promise<void>
}

export function CouponModal({ open, editingCoupon, values, setValues, submitting, errors, close, submit }: Props) {
  const isEdit = !!editingCoupon
  const globalError = errors['_global']

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? `編輯優惠券：${editingCoupon?.code}` : '新增優惠券'}
      size="lg"
    >
      <div className="p-5 flex flex-col gap-5">
        {globalError && (
          <div className="rounded-md px-4 py-2.5 text-sm text-danger bg-danger-muted border border-danger">
            {globalError}
          </div>
        )}

        {/* 代碼 + 標題 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="優惠碼 *"
            value={values.code}
            onChange={e => setValues(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            error={errors.code}
            placeholder="e.g. SUMMER20"
          />
          <Input
            label="標題（顯示名稱）"
            value={values.title}
            onChange={e => setValues(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. 夏季優惠 20%"
          />
        </div>

        {/* 折扣類型 + 折扣值 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="折扣類型"
            value={values.discount_type}
            options={DISCOUNT_TYPE_OPTIONS}
            onChange={e => setValues(prev => ({ ...prev, discount_type: e.target.value as CouponFormValues['discount_type'] }))}
          />
          {values.discount_type !== 'free_shipping' && (
            <Input
              label={values.discount_type === 'percentage' ? '折扣百分比（%）*' : '折扣金額（VAC）*'}
              type="number"
              min={0}
              max={values.discount_type === 'percentage' ? 100 : undefined}
              value={values.discount_value}
              onChange={e => setValues(prev => ({ ...prev, discount_value: e.target.value }))}
              error={errors.discount_value}
              placeholder={values.discount_type === 'percentage' ? '0 – 100' : '0'}
            />
          )}
        </div>

        {/* 最低消費 + 適用範圍 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="最低消費（VAC，0 = 不限）"
            type="number"
            min={0}
            value={values.min_purchase}
            onChange={e => setValues(prev => ({ ...prev, min_purchase: e.target.value }))}
            placeholder="0"
          />
          <Select
            label="適用訂單類型"
            value={values.applies_fulfillment}
            options={FULFILLMENT_OPTIONS}
            onChange={e => setValues(prev => ({ ...prev, applies_fulfillment: e.target.value as CouponFormValues['applies_fulfillment'] }))}
          />
        </div>

        {/* 到期日 */}
        <Input
          label="到期日（留空 = 永久有效）"
          type="date"
          value={values.expires_at}
          onChange={e => setValues(prev => ({ ...prev, expires_at: e.target.value }))}
        />

        {/* 備注 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">內部備注</label>
          <textarea
            value={values.internal_note}
            onChange={e => setValues(prev => ({ ...prev, internal_note: e.target.value }))}
            rows={2}
            placeholder="僅管理員可見..."
            className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none"
          />
        </div>

        {/* 啟用狀態 toggle */}
        <div
          className="rounded-lg border border-border px-4 py-3"
          style={{ background: 'var(--color-surface-elevated)' }}
        >
          <ToggleField
            label="啟用狀態"
            hint="關閉後此優惠券無法被前台使用"
            checked={values.is_active}
            onChange={v => setValues(prev => ({ ...prev, is_active: v }))}
          />
        </div>

        {/* 動作按鈕 */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="md" onClick={close} disabled={submitting}>
            取消
          </Button>
          <Button size="md" loading={submitting} onClick={() => void submit()}>
            {isEdit ? '儲存變更' : '建立優惠券'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
