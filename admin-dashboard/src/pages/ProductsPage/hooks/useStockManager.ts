import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbProduct, DbProductVariant } from '@/types'

export const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const
export type ApparelSize = (typeof APPAREL_SIZES)[number]

export function useStockManager() {
  const [open, setOpen] = useState(false)
  const [product, setProduct] = useState<DbProduct | null>(null)
  const [variants, setVariants] = useState<DbProductVariant[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  // key = size string or 'default' for unsized products
  const [draft, setDraft] = useState<Record<string, number>>({})

  const openStock = useCallback(async (p: DbProduct) => {
    setProduct(p)
    setOpen(true)
    setLoading(true)
    try {
      const { data } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', p.id)
        .order('size', { ascending: true, nullsFirst: true })
      const v = (data as DbProductVariant[]) ?? []
      setVariants(v)

      const d: Record<string, number> = {}
      if (p.category === 'apparel') {
        for (const size of APPAREL_SIZES) {
          d[size] = v.find(x => x.size === size)?.stock_quantity ?? 0
        }
      } else {
        d['default'] = v.find(x => x.size === null)?.stock_quantity ?? 0
      }
      setDraft(d)
    } finally {
      setLoading(false)
    }
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setProduct(null)
    setVariants([])
    setDraft({})
  }, [])

  const updateDraft = useCallback((key: string, qty: number) => {
    setDraft(prev => ({ ...prev, [key]: Math.max(0, qty) }))
  }, [])

  const save = useCallback(async () => {
    if (!product) return
    setSaving(true)
    try {
      if (product.category === 'apparel') {
        for (const size of APPAREL_SIZES) {
          const qty = draft[size] ?? 0
          const existing = variants.find(v => v.size === size)
          if (existing) {
            const { error } = await supabase
              .from('product_variants')
              .update({ stock_quantity: qty })
              .eq('id', existing.id)
            if (error) throw error
          } else {
            const { error } = await supabase.from('product_variants').insert({
              product_id: product.id,
              size,
              stock_quantity: qty,
            })
            if (error) throw error
          }
        }
      } else {
        const qty = draft['default'] ?? 0
        const existing = variants.find(v => v.size === null)
        if (existing) {
          const { error } = await supabase
            .from('product_variants')
            .update({ stock_quantity: qty })
            .eq('id', existing.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('product_variants').insert({
            product_id: product.id,
            size: null,
            stock_quantity: qty,
          })
          if (error) throw error
        }
      }
      close()
    } catch (err) {
      alert(err instanceof Error ? err.message : '庫存更新失敗，請重試')
    } finally {
      setSaving(false)
    }
  }, [product, variants, draft, close])

  const totalStock = Object.values(draft).reduce((sum, q) => sum + q, 0)

  return {
    open,
    product,
    loading,
    saving,
    draft,
    totalStock,
    APPAREL_SIZES,
    openStock,
    close,
    updateDraft,
    save,
  }
}
