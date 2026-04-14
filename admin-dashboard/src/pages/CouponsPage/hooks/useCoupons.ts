import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbCoupon } from '@/types'

export type CouponFormValues = {
  code: string
  title: string
  discount_type: 'percentage' | 'fixed' | 'free_shipping'
  discount_value: string
  min_purchase: string
  applies_fulfillment: 'physical' | 'digital' | 'any'
  expires_at: string
  is_active: boolean
  internal_note: string
}

const DEFAULT_FORM: CouponFormValues = {
  code: '',
  title: '',
  discount_type: 'percentage',
  discount_value: '',
  min_purchase: '0',
  applies_fulfillment: 'any',
  expires_at: '',
  is_active: true,
  internal_note: '',
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<DbCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<DbCoupon | null>(null)
  const [formValues, setFormValues] = useState<CouponFormValues>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CouponFormValues | '_global', string>>>({})

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (!includeDeleted) {
        query = query.is('deleted_at', null)
      }

      const { data } = await query
      setCoupons((data as DbCoupon[]) ?? [])
    } finally {
      setLoading(false)
    }
  }, [includeDeleted])

  useEffect(() => {
    void fetchCoupons()
  }, [fetchCoupons])

  function openCreate() {
    setEditingCoupon(null)
    setFormValues(DEFAULT_FORM)
    setFormErrors({})
    setModalOpen(true)
  }

  function openEdit(coupon: DbCoupon) {
    setEditingCoupon(coupon)
    setFormValues({
      code: coupon.code,
      title: coupon.title ?? '',
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_purchase: String(coupon.min_purchase),
      applies_fulfillment: coupon.applies_fulfillment,
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
      is_active: coupon.is_active,
      internal_note: coupon.internal_note ?? '',
    })
    setFormErrors({})
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingCoupon(null)
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof CouponFormValues | '_global', string>> = {}
    if (!formValues.code.trim()) errors.code = '請輸入優惠碼'
    if (formValues.discount_type !== 'free_shipping') {
      if (!formValues.discount_value || Number(formValues.discount_value) <= 0)
        errors.discount_value = '請輸入有效折扣值'
      if (formValues.discount_type === 'percentage' && Number(formValues.discount_value) > 100)
        errors.discount_value = '百分比折扣不能超過 100'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function submitCoupon() {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        code: formValues.code.trim().toUpperCase(),
        title: formValues.title.trim() || null,
        discount_type: formValues.discount_type,
        discount_value: Number(formValues.discount_value),
        min_purchase: Number(formValues.min_purchase) || 0,
        applies_fulfillment: formValues.applies_fulfillment,
        expires_at: formValues.expires_at ? new Date(formValues.expires_at).toISOString() : null,
        is_active: formValues.is_active,
        internal_note: formValues.internal_note.trim() || null,
      }

      if (editingCoupon) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingCoupon.id)
        if (error) { setFormErrors({ _global: error.message }); return }
      } else {
        const { error } = await supabase.from('coupons').insert(payload)
        if (error) { setFormErrors({ _global: error.message }); return }
      }

      closeModal()
      void fetchCoupons()
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleCoupon(coupon: DbCoupon) {
    await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id)
    void fetchCoupons()
  }

  async function deleteCoupon(id: string) {
    if (!confirm('確定要刪除此優惠券？')) return
    // 軟刪除：設定 deleted_at 而非真正從 DB 移除，保留審計軌跡
    await supabase.from('coupons').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    void fetchCoupons()
  }

  return {
    coupons, loading,
    includeDeleted, setIncludeDeleted,
    modalOpen, editingCoupon,
    formValues, setFormValues,
    submitting, formErrors,
    refetch: fetchCoupons,
    openCreate, openEdit, closeModal,
    submitCoupon, toggleCoupon, deleteCoupon,
  }
}
