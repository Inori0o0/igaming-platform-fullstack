import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbOrder } from '@/types'

const PAGE_SIZE = 20

export function useOrders() {
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (statusFilter) query = query.eq('status', statusFilter)
      if (search.trim()) query = query.eq('user_id', search.trim())

      const { data, count, error } = await query
      if (error) throw error
      setOrders((data as DbOrder[]) ?? [])
      setTotal(count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  // 篩選條件改變時重設頁碼，避免空分頁
  useEffect(() => {
    setPage(0)
  }, [search, statusFilter])

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    void fetchOrders()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    orders, total, page, setPage,
    search, setSearch,
    statusFilter, setStatusFilter,
    loading, totalPages,
    refetch: fetchOrders,
    updateStatus,
  }
}
