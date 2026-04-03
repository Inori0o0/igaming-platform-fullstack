import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbUser, DbWallet, DbOrder } from '@/types'

/** 由 wager + payout 兩筆 transaction 合併而成的單局遊戲快照 */
export interface GameSession {
  id: string
  game_id: string
  theme_id: string | null
  bet_amount: number
  win_amount: number
  created_at: string
}

export function useUserDetail(userId: string | undefined) {
  const [user, setUser] = useState<DbUser | null>(null)
  const [wallet, setWallet] = useState<DbWallet | null>(null)
  const [games, setGames] = useState<GameSession[]>([])
  const [gameTotal, setGameTotal] = useState(0)
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async (id: string) => {
    setLoading(true)
    try {
      // 並行查詢用戶資訊、錢包、遊戲紀錄（wager + payout）、訂單
      const [userRes, walletRes, wagerRes, payoutRes, ordersRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', id).single(),
        supabase.from('wallets').select('*').eq('user_id', id).single(),
        // wager：取最新 10 筆並取得總場次數（count: 'exact'）
        supabase
          .from('transactions')
          .select('id, game_id, theme_id, round_id, amount, created_at', { count: 'exact' })
          .eq('user_id', id)
          .eq('type', 'wager')
          .eq('status', 'completed')
          .eq('currency', 'VAC')
          .order('created_at', { ascending: false })
          .range(0, 9),
        // payout：抓取全部（用於與 wager 用 round_id 對應，取得每局派彩金額）
        supabase
          .from('transactions')
          .select('round_id, amount')
          .eq('user_id', id)
          .eq('type', 'payout')
          .eq('status', 'completed')
          .eq('currency', 'VAC'),
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      setUser(userRes.data as DbUser | null)
      setWallet(walletRes.data as DbWallet | null)
      setOrders((ordersRes.data as DbOrder[]) ?? [])
      setGameTotal(wagerRes.count ?? 0)

      // 建立 round_id → payout 金額的對應表，方便 O(1) 查找
      const payoutMap: Record<string, number> = {}
      for (const p of payoutRes.data ?? []) {
        if (p.round_id) payoutMap[p.round_id] = Number(p.amount) || 0
      }

      const sessions: GameSession[] = (wagerRes.data ?? []).map((w) => ({
        id: w.id,
        game_id: w.game_id ?? '—',
        theme_id: w.theme_id ?? null,
        bet_amount: Number(w.amount) || 0,
        win_amount: w.round_id ? (payoutMap[w.round_id] ?? 0) : 0,
        created_at: w.created_at,
      }))
      setGames(sessions)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    void fetchData(userId)
  }, [userId, fetchData])

  const banUser = useCallback(async () => {
    if (!userId) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ banned_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
      setUser((prev) => prev ? { ...prev, banned_at: new Date().toISOString() } : null)
    } finally {
      setActionLoading(false)
    }
  }, [userId])

  const unbanUser = useCallback(async () => {
    if (!userId) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ banned_at: null })
        .eq('id', userId)
      if (error) throw error
      setUser((prev) => prev ? { ...prev, banned_at: null } : null)
    } finally {
      setActionLoading(false)
    }
  }, [userId])

  /** 直接設定錢包餘額（管理員專用，需有 admin_update_wallets RLS policy） */
  const setWalletBalance = useCallback(async (amount: number) => {
    if (!userId || !wallet) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ coin_balance: amount })
        .eq('user_id', userId)
      if (error) throw error
      setWallet((prev) => prev ? { ...prev, coin_balance: amount } : null)
    } finally {
      setActionLoading(false)
    }
  }, [userId, wallet])

  /**
   * 匿名化用戶資料（不可逆操作）：
   * 清除個資欄位並同時停權，保留遊戲紀錄、訂單等統計資料不受影響。
   */
  const anonymizeUser = useCallback(async () => {
    if (!userId) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: '已刪除用戶',
          email: null,
          avatar_url: null,
          is_guest: true,
          banned_at: new Date().toISOString(),
        })
        .eq('id', userId)
      if (error) throw error
      setUser((prev) =>
        prev
          ? { ...prev, display_name: '已刪除用戶', email: null, avatar_url: null, is_guest: true, banned_at: new Date().toISOString() }
          : null,
      )
    } finally {
      setActionLoading(false)
    }
  }, [userId])

  return { user, wallet, games, gameTotal, orders, loading, banUser, unbanUser, anonymizeUser, setWalletBalance, actionLoading }
}
