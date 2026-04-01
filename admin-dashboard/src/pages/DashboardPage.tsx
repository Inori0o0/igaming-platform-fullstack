import { useEffect, useState } from 'react'
import { Users, Gamepad2, Wallet } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface DashboardStats {
  totalUsers: number
  activeToday: number
  totalGames: number
  totalTransactionVolume: number
}

interface DailyActive {
  date: string
  count: number
}

interface GameTypeStat {
  name: string
  value: number
}

const CHART_COLORS = ['#d4a843', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export function DashboardPage() {
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
      const [usersRes, gamesTodayRes, gamesRes, txRes, gameTypeRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase
          .from('game_history')
          .select('user_id')
          .gte('played_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        supabase.from('game_history').select('id', { count: 'exact', head: true }),
        supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'completed'),
        supabase
          .from('game_history')
          .select('game_type')
          .order('played_at', { ascending: false })
          .limit(1000),
      ])

      const totalVolume = (txRes.data ?? []).reduce((sum, t) => sum + (t.amount ?? 0), 0)
      const activeIds = new Set((gamesTodayRes.data ?? []).map((r) => r.user_id))

      setStats({
        totalUsers: usersRes.count ?? 0,
        activeToday: activeIds.size,
        totalGames: gamesRes.count ?? 0,
        totalTransactionVolume: totalVolume,
      })

      // Game type distribution
      const typeMap: Record<string, number> = {}
      for (const row of gameTypeRes.data ?? []) {
        typeMap[row.game_type] = (typeMap[row.game_type] ?? 0) + 1
      }
      setGameTypes(
        Object.entries(typeMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
      )

      // DAU trend - last 14 days
      const days: DailyActive[] = []
      for (let i = 13; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const start = new Date(d.setHours(0, 0, 0, 0)).toISOString()
        const end = new Date(d.setHours(23, 59, 59, 999)).toISOString()
        const { data } = await supabase
          .from('game_history')
          .select('user_id')
          .gte('played_at', start)
          .lte('played_at', end)
        const unique = new Set((data ?? []).map((r) => r.user_id)).size
        days.push({
          date: new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit' }).format(new Date(start)),
          count: unique,
        })
      }
      setDailyActive(days)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="總用戶數"
          value={formatNumber(stats?.totalUsers ?? 0)}
          icon={Users}
          subtitle="所有已註冊用戶"
          loading={loading}
        />
        <StatCard
          title="今日活躍"
          value={formatNumber(stats?.activeToday ?? 0)}
          icon={Gamepad2}
          subtitle="今日有遊戲紀錄"
          loading={loading}
        />
        <StatCard
          title="總遊戲次數"
          value={formatNumber(stats?.totalGames ?? 0)}
          icon={Gamepad2}
          subtitle="所有遊戲場次"
          loading={loading}
        />
        <StatCard
          title="總交易量"
          value={loading ? '—' : formatCurrency(stats?.totalTransactionVolume ?? 0)}
          icon={Wallet}
          subtitle="所有已完成交易"
          variant="gold"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* DAU trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>每日活躍用戶（近 14 天）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyActive} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text-primary)',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="活躍用戶"
                  stroke="var(--color-gold)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--color-gold)' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Game type distribution */}
        <Card>
          <CardHeader>
            <CardTitle>遊戲類型分布</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {gameTypes.length === 0 ? (
              <p className="text-sm text-text-muted py-8">暫無資料</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={gameTypes}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {gameTypes.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-text-primary)',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity placeholder */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>快速入口</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '新增商品', path: '/products' },
              { label: '查看訂單', path: '/orders' },
              { label: '用戶列表', path: '/users' },
              { label: '優惠券管理', path: '/settings' },
            ].map(({ label, path }) => (
              <a
                key={path}
                href={path}
                className="flex items-center justify-center rounded-md py-3 text-sm font-medium transition-all"
                style={{
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--color-gold)'
                  el.style.color = 'var(--color-gold)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--color-border)'
                  el.style.color = 'var(--color-text-secondary)'
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
