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
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTxs = useCallback(async () => {
    setLoading(true)
    try {
      // 使用 RPC：在 DB 端做 user_id::text ILIKE，避免 JS client 對 UUID column 的型別限制
      const { data, error } = await supabase.rpc('admin_search_transactions', {
        p_search: search.trim(),
        p_type: typeFilter,
        p_status: statusFilter,
        p_date_from: dateFrom ? `${dateFrom}T00:00:00.000Z` : null,
        p_date_to: dateTo ? `${dateTo}T23:59:59.999Z` : null,
        p_amount_min: amountMin !== '' ? Number(amountMin) : null,
        p_amount_max: amountMax !== '' ? Number(amountMax) : null,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      })
      if (error) throw error

      const rows = (data ?? []) as Array<DbTransaction & { total_count: number }>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setTxs(rows.map(({ total_count, ...tx }) => tx as DbTransaction))
      setTotal(rows[0]?.total_count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter, statusFilter, dateFrom, dateTo, amountMin, amountMax])

  useEffect(() => {
    void fetchTxs()
  }, [fetchTxs])

  // React 19 規範：不在 useEffect 裡做衍生狀態同步
  const handleSetSearch = useCallback((v: string) => { setSearch(v); setPage(0) }, [])
  const handleSetTypeFilter = useCallback((v: string) => { setTypeFilter(v); setPage(0) }, [])
  const handleSetStatusFilter = useCallback((v: string) => { setStatusFilter(v); setPage(0) }, [])
  const handleSetDateFrom = useCallback((v: string) => { setDateFrom(v); setPage(0) }, [])
  const handleSetDateTo = useCallback((v: string) => { setDateTo(v); setPage(0) }, [])
  const handleSetAmountMin = useCallback((v: string) => { setAmountMin(v); setPage(0) }, [])
  const handleSetAmountMax = useCallback((v: string) => { setAmountMax(v); setPage(0) }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    txs, total, page, setPage,
    search, setSearch: handleSetSearch,
    typeFilter, setTypeFilter: handleSetTypeFilter,
    statusFilter, setStatusFilter: handleSetStatusFilter,
    dateFrom, setDateFrom: handleSetDateFrom,
    dateTo, setDateTo: handleSetDateTo,
    amountMin, setAmountMin: handleSetAmountMin,
    amountMax, setAmountMax: handleSetAmountMax,
    loading, totalPages, refetch: fetchTxs,
  }
}
