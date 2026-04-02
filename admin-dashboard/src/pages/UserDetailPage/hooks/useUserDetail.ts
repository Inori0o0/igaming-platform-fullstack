import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbUser, DbWallet, DbGameHistory, DbOrder } from '@/types'

export function useUserDetail(userId: string | undefined) {
  const [user, setUser] = useState<DbUser | null>(null)
  const [wallet, setWallet] = useState<DbWallet | null>(null)
  const [games, setGames] = useState<DbGameHistory[]>([])
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async (id: string) => {
    setLoading(true)
    try {
      // 並行查詢用戶資訊、錢包、遊戲紀錄、訂單，減少總等待時間
      const [userRes, walletRes, gamesRes, ordersRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', id).single(),
        supabase.from('wallets').select('*').eq('user_id', id).single(),
        supabase.from('game_history').select('*').eq('user_id', id).order('played_at', { ascending: false }).limit(10),
        supabase.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
      ])
      setUser(userRes.data as DbUser | null)
      setWallet(walletRes.data as DbWallet | null)
      setGames((gamesRes.data as DbGameHistory[]) ?? [])
      setOrders((ordersRes.data as DbOrder[]) ?? [])
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

  return { user, wallet, games, orders, loading, banUser, unbanUser, anonymizeUser, actionLoading }
}
