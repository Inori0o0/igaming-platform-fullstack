import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbOrderItem } from '@/types'

export interface OrderItemWithProduct extends DbOrderItem {
  products: {
    name: string
    image_url: string | null
    is_avatar: boolean
  } | null
}

export function useOrderDetail(orderId: string | null) {
  const [items, setItems] = useState<OrderItemWithProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setItems([])
      return
    }

    let cancelled = false

    const fetchItems = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: fetchError } = await supabase
          .from('order_items')
          .select('*, products(name, image_url, is_avatar)')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true })

        if (cancelled) return
        if (fetchError) throw fetchError
        setItems((data as OrderItemWithProduct[]) ?? [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '載入失敗')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchItems()
    return () => { cancelled = true }
  }, [orderId])

  return { items, loading, error }
}
