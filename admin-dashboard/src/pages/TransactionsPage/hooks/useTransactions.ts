import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbTransaction } from '@/types'

const PAGE_SIZE = 25

export function useTransactions() {
  const [txs, setTxs] = useState<DbTransaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTxs = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (typeFilter) query = query.eq('type', typeFilter)
      if (statusFilter) query = query.eq('status', statusFilter)
      // 以 user_id（UUID 字串）精確匹配，不做模糊搜尋
      if (search.trim()) query = query.eq('user_id', search.trim())

      const { data, count, error } = await query
      if (error) throw error
      setTxs((data as DbTransaction[]) ?? [])
      setTotal(count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter, statusFilter])

  useEffect(() => {
    void fetchTxs()
  }, [fetchTxs])

  // 任何篩選條件改變時重設頁碼，避免空分頁
  useEffect(() => {
    setPage(0)
  }, [search, typeFilter, statusFilter])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    txs, total, page, setPage,
    search, setSearch,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    loading, totalPages, refetch: fetchTxs,
  }
}
