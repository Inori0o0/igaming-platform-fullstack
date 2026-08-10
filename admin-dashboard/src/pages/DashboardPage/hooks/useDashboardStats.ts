import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { asJsonObject } from '@shared/supabase/json'
import type { Json } from '@shared/database.types'
import { createTranslator, DEFAULT_LOCALE } from '@shared/i18n'

interface AdminDashboardRpcResult {
  total_users: number
  active_today: number
  total_wagers: number
  total_transaction_volume: number
  total_orders: number
  total_products: number
  // SQL 端以 generate_series 補齊 14 天，格式為 MM/DD
  dau_trend: { date: string; count: number }[]
  // 依下注局數降序排列
  game_types: { game_id: string; count: number }[]
}

export interface DashboardStats {
  totalUsers: number
  activeToday: number
  totalWagers: number
  /** 已格式化為貨幣字串，直接傳入 StatCard 顯示，UI 層無需再計算 */
  totalTransactionVolume: string
  totalProducts: number
  totalOrders: number
}

export interface DailyActive {
  date: string
  count: number
}

export interface GameTypeStat {
  name: string
  value: number
}

function readNumber(value: Json | undefined, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function parseDashboardRpc(data: Json | null): AdminDashboardRpcResult | null {
  const obj = asJsonObject(data)
  if (!obj) return null

  const dauTrendRaw = obj.dau_trend
  const gameTypesRaw = obj.game_types

  const dau_trend: AdminDashboardRpcResult['dau_trend'] = Array.isArray(dauTrendRaw)
    ? dauTrendRaw.flatMap((row) => {
        const item = asJsonObject(row)
        if (!item || typeof item.date !== 'string') return []
        return [{ date: item.date, count: readNumber(item.count) }]
      })
    : []

  const game_types: AdminDashboardRpcResult['game_types'] = Array.isArray(gameTypesRaw)
    ? gameTypesRaw.flatMap((row) => {
        const item = asJsonObject(row)
        if (!item || typeof item.game_id !== 'string') return []
        return [{ game_id: item.game_id, count: readNumber(item.count) }]
      })
    : []

  return {
    total_users: readNumber(obj.total_users),
    active_today: readNumber(obj.active_today),
    total_wagers: readNumber(obj.total_wagers),
    total_transaction_volume: readNumber(obj.total_transaction_volume),
    total_orders: readNumber(obj.total_orders),
    total_products: readNumber(obj.total_products),
    dau_trend,
    game_types,
  }
}

function gameDisplayName(gameId: string): string {
  const t = createTranslator(DEFAULT_LOCALE)
  if (gameId === 'blackjack') return t('game.blackjack')
  if (gameId === 'slots') return t('game.slots')
  if (gameId === 'baccarat') return t('game.baccarat')
  return gameId
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [dailyActive, setDailyActive] = useState<DailyActive[]>([])
  const [gameTypes, setGameTypes] = useState<GameTypeStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      // 呼叫 SECURITY DEFINER 函式，繞過各資料表的 RLS 取得全局統計
      // 函式內部第一行已驗證 JWT role = 'admin'，非管理員會收到 exception
      // 前置設定：Supabase Dashboard → Authentication → Users → 管理員帳號
      //           → Edit → App Metadata → 填入 {"role": "admin"} 並儲存
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats')
      if (error) throw error

      const d = parseDashboardRpc(data)
      if (!d) throw new Error('儀表板統計回傳格式異常')

      setStats({
        totalUsers:             d.total_users,
        activeToday:            d.active_today,
        totalWagers:            d.total_wagers,
        totalTransactionVolume: formatCurrency(d.total_transaction_volume),
        totalProducts:          d.total_products,
        totalOrders:            d.total_orders,
      })

      // SQL 端已補齊 14 天並格式化為 MM/DD，直接使用
      setDailyActive(
        d.dau_trend.map((row) => ({ date: row.date, count: row.count })),
      )

      // game_id 對應顯示名稱；未登記的 id 直接顯示原始值，保持擴充彈性
      setGameTypes(
        d.game_types.map((row) => ({
          name:  gameDisplayName(row.game_id),
          value: row.count,
        })),
      )
    } finally {
      setLoading(false)
    }
  }

  return { stats, dailyActive, gameTypes, loading }
}
