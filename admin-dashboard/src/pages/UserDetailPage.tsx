import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wallet, Gamepad2, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { DbUser, DbWallet, DbGameHistory, DbOrder } from '@/types'
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty } from '@/components/ui/Table'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<DbUser | null>(null)
  const [wallet, setWallet] = useState<DbWallet | null>(null)
  const [games, setGames] = useState<DbGameHistory[]>([])
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    void fetchData(id)
  }, [id])

  async function fetchData(userId: string) {
    setLoading(true)
    try {
      const [userRes, walletRes, gamesRes, ordersRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('wallets').select('*').eq('user_id', userId).single(),
        supabase.from('game_history').select('*').eq('user_id', userId).order('played_at', { ascending: false }).limit(10),
        supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      ])
      setUser(userRes.data as DbUser | null)
      setWallet(walletRes.data as DbWallet | null)
      setGames((gamesRes.data as DbGameHistory[]) ?? [])
      setOrders((ordersRes.data as DbOrder[]) ?? [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-text-muted">
        <p>找不到此用戶</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/users')}>
          返回列表
        </Button>
      </div>
    )
  }

  const orderStatusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'info' }> = {
    pending: { label: '待處理', variant: 'warning' },
    processing: { label: '處理中', variant: 'info' },
    completed: { label: '已完成', variant: 'success' },
    cancelled: { label: '已取消', variant: 'danger' },
    refunded: { label: '已退款', variant: 'default' },
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/users')} className="w-fit">
        <ArrowLeft size={14} />
        返回用戶列表
      </Button>

      {/* User info header */}
      <Card>
        <CardContent className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full text-xl font-bold text-background shrink-0"
            style={{ background: 'var(--color-gold)' }}
          >
            {(user.display_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-text-primary">
                {user.display_name ?? '未命名'}
              </h2>
              {user.is_guest ? (
                <Badge variant="warning">訪客</Badge>
              ) : (
                <Badge variant="success">正式用戶</Badge>
              )}
            </div>
            <p className="text-sm text-text-muted mt-0.5">{user.email ?? '—'}</p>
            <p className="text-xs text-text-muted mt-1">
              註冊時間：{formatDate(user.created_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">ID</p>
            <p className="text-xs font-mono text-text-secondary mt-0.5 max-w-[140px] truncate">
              {user.id}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wallet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-md"
              style={{ background: 'var(--color-gold-muted)' }}
            >
              <Wallet size={18} style={{ color: 'var(--color-gold)' }} />
            </div>
            <div>
              <p className="text-xs text-text-muted">VAC 餘額</p>
              <p className="text-lg font-bold text-gold-light">
                {formatCurrency(wallet?.coin_balance ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-md"
              style={{ background: 'var(--color-info-muted)' }}
            >
              <Gamepad2 size={18} style={{ color: 'var(--color-info)' }} />
            </div>
            <div>
              <p className="text-xs text-text-muted">遊戲場次</p>
              <p className="text-lg font-bold text-text-primary">
                {formatNumber(games.length)}+
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-md"
              style={{ background: 'var(--color-success-muted)' }}
            >
              <ShoppingBag size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div>
              <p className="text-xs text-text-muted">訂單數</p>
              <p className="text-lg font-bold text-text-primary">
                {formatNumber(orders.length)}+
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent games */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>近期遊戲紀錄（最新 10 筆）</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>遊戲類型</TableHead>
                <TableHead>下注</TableHead>
                <TableHead>贏得</TableHead>
                <TableHead>時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.length === 0 ? (
                <TableEmpty message="無遊戲紀錄" />
              ) : (
                games.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <Badge variant="gold">{g.game_type}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(g.bet_amount)}</TableCell>
                    <TableCell>
                      <span style={{ color: g.win_amount > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        {formatCurrency(g.win_amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-text-muted">{formatDate(g.played_at)}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>近期訂單（最新 10 筆）</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>訂單 ID</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableEmpty message="無訂單紀錄" />
              ) : (
                orders.map((o) => {
                  const statusInfo = orderStatusMap[o.status] ?? { label: o.status, variant: 'default' as const }
                  return (
                    <TableRow key={o.id}>
                      <TableCell>
                        <span className="text-xs font-mono text-text-muted">
                          {o.id.slice(0, 8)}…
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(o.total_vac ?? o.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-text-muted">{formatDate(o.created_at)}</span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
