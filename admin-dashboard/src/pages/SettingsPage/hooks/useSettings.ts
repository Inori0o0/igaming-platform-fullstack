import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbCoupon } from '@/types'

export function useSettings() {
  const [coupons, setCoupons] = useState<DbCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [freeClaimAmount, setFreeClaimAmount] = useState('100')
  const [savingClaim, setSavingClaim] = useState(false)

  useEffect(() => {
    void fetchCoupons()
  }, [])

  async function fetchCoupons() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .is('deleted_at', null)  // 軟刪除：deleted_at 有值表示已刪除，排除在外
        .order('created_at', { ascending: false })
      setCoupons((data as DbCoupon[]) ?? [])
    } finally {
      setLoading(false)
    }
  }

  const toggleCoupon = async (coupon: DbCoupon) => {
    await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id)
    void fetchCoupons()
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('確定要刪除此優惠券？')) return
    // 軟刪除：設定 deleted_at 而非真正從 DB 移除，保留審計軌跡
    await supabase.from('coupons').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    void fetchCoupons()
  }

  const handleSaveClaim = async () => {
    setSavingClaim(true)
    await new Promise((r) => setTimeout(r, 500))
    setSavingClaim(false)
    alert(`已儲存免費領取金額：${freeClaimAmount} VAC（需後端實作對應設定表）`)
  }

  return {
    coupons, loading,
    freeClaimAmount, setFreeClaimAmount,
    savingClaim,
    refetch: fetchCoupons,
    toggleCoupon, deleteCoupon, handleSaveClaim,
  }
}
