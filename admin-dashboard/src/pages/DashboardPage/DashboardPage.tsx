import { Users, Gamepad2, Wallet, Package, ShoppingCart, Activity } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { formatNumber } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useDashboardStats } from './hooks/useDashboardStats'

const CHART_COLORS = ['#d4a843', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export function DashboardPage() {
  const { stats, dailyActive, gameTypes, loading } = useDashboardStats()

  return (
    <div className="flex flex-col gap-6">
      {/* KPI 統計卡：2 行 × 3 欄，共 6 個指標 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="總用戶數" value={formatNumber(stats?.totalUsers ?? 0)} icon={Users} subtitle="所有已註冊用戶" loading={loading} />
        <StatCard title="今日活躍" value={formatNumber(stats?.activeToday ?? 0)} icon={Activity} subtitle="今日有下注紀錄" loading={loading} />
        <StatCard title="總遊戲次數" value={formatNumber(stats?.totalWagers ?? 0)} icon={Gamepad2} subtitle="累計下注局數" loading={loading} />
        <StatCard title="總交易金額" value={loading ? '—' : (stats?.totalTransactionVolume ?? '—')} icon={Wallet} subtitle="所有已完成交易" variant="gold" loading={loading} />
        <StatCard title="上架商品" value={formatNumber(stats?.totalProducts ?? 0)} icon={Package} subtitle="目前上架中商品數" loading={loading} />
        <StatCard title="總訂單數" value={formatNumber(stats?.totalOrders ?? 0)} icon={ShoppingCart} subtitle="所有訂單累計" loading={loading} />
      </div>

      {/* 圖表區：折線圖（寬）+ 圓餅圖（窄）*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>每日活躍用戶（近 14 天）</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyActive} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: 12 }} />
                <Line type="monotone" dataKey="count" name="活躍用戶" stroke="var(--color-gold)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-gold)' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>遊戲類型分布</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {gameTypes.length === 0 ? (
              <p className="text-sm text-text-muted py-8">暫無資料</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={gameTypes} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {gameTypes.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(value) => (
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{value}</span>
                  )} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 快速入口 */}
      <Card>
        <CardHeader className="pb-4"><CardTitle>快速入口</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '新增商品', path: '/products' },
              { label: '查看訂單', path: '/orders' },
              { label: '用戶列表', path: '/users' },
              { label: '優惠券管理', path: '/settings' },
            ].map(({ label, path }) => (
              <a
                key={path} href={path}
                className="flex items-center justify-center rounded-md py-3 text-sm font-medium transition-all"
                style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
              >{label}</a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
