import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

// game_id 欄位儲存的是前端遊戲組件的英文識別碼，統一對應為中文顯示名稱
// 若未來新增遊戲類型，在此補上對應即可
const GAME_DISPLAY_NAMES: Record<string, string> = {
  blackjack: '二十一點',
  slots: '老虎機',
  baccarat: '百家樂',
}

// SQL 函式回傳的 JSON 結構型別
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

      const d = data as AdminDashboardRpcResult

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
        (d.dau_trend ?? []).map((row) => ({ date: row.date, count: row.count })),
      )

      // game_id 對應中文名稱；未登記的 id 直接顯示原始值，保持擴充彈性
      setGameTypes(
        (d.game_types ?? []).map((row) => ({
          name:  GAME_DISPLAY_NAMES[row.game_id] ?? row.game_id,
          value: row.count,
        })),
      )
    } finally {
      setLoading(false)
    }
  }

  return { stats, dailyActive, gameTypes, loading }
}
