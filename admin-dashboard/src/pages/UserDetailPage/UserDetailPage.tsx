import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wallet, Gamepad2, ShoppingBag, UserX, UserCheck, Trash2 } from 'lucide-react'
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty } from '@/components/ui/Table'
import { useUserDetail } from './hooks/useUserDetail'

// 訂單狀態 → 顯示文字 + Badge 顏色的對應表（純顯示配置）
const ORDER_STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'info' }> = {
  pending: { label: '待處理', variant: 'warning' },
  processing: { label: '處理中', variant: 'info' },
  completed: { label: '已完成', variant: 'success' },
  cancelled: { label: '已取消', variant: 'danger' },
  refunded: { label: '已退款', variant: 'default' },
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, wallet, games, gameTotal, orders, loading, banUser, unbanUser, anonymizeUser, setWalletBalance, actionLoading } = useUserDetail(id)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [balanceInput, setBalanceInput] = useState('')

  async function handleBanToggle() {
    if (!user) return
    const isBanned = Boolean(user.banned_at)
    const name = user.display_name ?? user.id
    const msg = isBanned
      ? `確定要解除「${name}」的停權嗎？`
      : `確定要停權「${name}」嗎？此用戶將無法登入。`
    if (!window.confirm(msg)) return
    if (isBanned) {
      await unbanUser()
    } else {
      await banUser()
    }
  }

  async function handleAnonymize() {
    if (!user) return
    await anonymizeUser()
    setConfirmEmail('')
    navigate('/users')
  }

  // 訪客帳號沒有 email，改為輸入 user id 前 8 碼來確認
  const confirmTarget = user?.email ?? user?.id.slice(0, 8) ?? ''
  const confirmPlaceholder = user?.email ? '輸入該用戶的 Email 以確認' : `輸入用戶 ID 前 8 碼：${user?.id.slice(0, 8)}`
  const isConfirmMatch = confirmEmail === confirmTarget

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-text-muted">
        <p>找不到此用戶</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/users')}>返回列表</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Button variant="ghost" size="sm" onClick={() => navigate('/users')} className="w-fit">
        <ArrowLeft size={14} />返回用戶列表
      </Button>

      <Card>
        <CardContent className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full text-xl font-bold text-background shrink-0"
            style={{ background: user.banned_at ? 'var(--color-danger)' : 'var(--color-gold)' }}
          >
            {(user.display_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-text-primary">{user.display_name ?? '未命名'}</h2>
              {user.is_guest ? <Badge variant="warning">訪客</Badge> : <Badge variant="success">正式用戶</Badge>}
              {user.banned_at
                ? <Badge variant="danger">已停權</Badge>
                : <Badge variant="default">正常</Badge>
              }
            </div>
            <p className="text-sm text-text-muted mt-0.5">{user.email ?? '—'}</p>
            <p className="text-xs text-text-muted mt-1">註冊時間：{formatDate(user.created_at)}</p>
            {user.banned_at && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger)' }}>
                停權時間：{formatDate(user.banned_at)}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div>
              <p className="text-xs text-text-muted">ID</p>
              <p className="text-xs font-mono text-text-secondary mt-0.5 max-w-[140px] truncate">{user.id}</p>
            </div>
            <Button
              variant={user.banned_at ? 'secondary' : 'danger'}
              size="sm"
              disabled={actionLoading}
              onClick={() => void handleBanToggle()}
            >
              {user.banned_at ? <><UserCheck size={14} />解除停權</> : <><UserX size={14} />停權用戶</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md shrink-0" style={{ background: 'var(--color-gold-muted)' }}>
              <Wallet size={18} style={{ color: 'var(--color-gold)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">VAC 餘額</p>
              <p className="text-lg font-bold text-gold-light">{formatCurrency(wallet?.coin_balance ?? 0)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="設定新餘額..."
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="h-7 text-xs py-1"
                />
                <Button
                  variant="danger"
                  size="sm"
                  disabled={balanceInput === '' || isNaN(Number(balanceInput)) || Number(balanceInput) < 0 || actionLoading}
                  onClick={() => {
                    const amount = Number(balanceInput)
                    if (!window.confirm(`確定要將此用戶的 VAC 餘額設定為 ${amount.toLocaleString()} VAC 嗎？此操作無法復原。`)) return
                    void setWalletBalance(amount).then(() => setBalanceInput(''))
                  }}
                >
                  設定
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md" style={{ background: 'var(--color-info-muted)' }}>
              <Gamepad2 size={18} style={{ color: 'var(--color-info)' }} />
            </div>
            <div>
              <p className="text-xs text-text-muted">遊戲場次</p>
              <p className="text-lg font-bold text-text-primary">{formatNumber(gameTotal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md" style={{ background: 'var(--color-success-muted)' }}>
              <ShoppingBag size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div>
              <p className="text-xs text-text-muted">訂單數</p>
              <p className="text-lg font-bold text-text-primary">{formatNumber(orders.length)}+</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle>近期遊戲紀錄（最新 10 筆）</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>遊戲</TableHead><TableHead>主題</TableHead><TableHead>下注</TableHead><TableHead>贏得</TableHead><TableHead>時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.length === 0 ? <TableEmpty message="無遊戲紀錄" /> : (
                games.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell><Badge variant="gold">{g.game_id}</Badge></TableCell>
                    <TableCell><span className="text-xs text-text-muted">{g.theme_id ?? '—'}</span></TableCell>
                    <TableCell>{formatCurrency(g.bet_amount)}</TableCell>
                    <TableCell>
                      <span style={{ color: g.win_amount > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        {formatCurrency(g.win_amount)}
                      </span>
                    </TableCell>
                    <TableCell><span className="text-xs text-text-muted">{formatDate(g.created_at)}</span></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle>近期訂單（最新 10 筆）</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>訂單 ID</TableHead><TableHead>金額</TableHead><TableHead>狀態</TableHead><TableHead>時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? <TableEmpty message="無訂單紀錄" /> : (
                orders.map((o) => {
                  const statusInfo = ORDER_STATUS_MAP[o.status] ?? { label: o.status, variant: 'default' as const }
                  return (
                    <TableRow key={o.id}>
                      <TableCell><span className="text-xs font-mono text-text-muted">{o.id.slice(0, 8)}…</span></TableCell>
                      <TableCell>{formatCurrency(o.total_vac ?? o.total_amount)}</TableCell>
                      <TableCell><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></TableCell>
                      <TableCell><span className="text-xs text-text-muted">{formatDate(o.created_at)}</span></TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 危險操作區 — 匿名化為不可逆，需輸入 email 或 ID 確認 */}
      <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger-muted)' }}>
        <div className="flex items-center gap-2">
          <Trash2 size={16} style={{ color: 'var(--color-danger)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>危險操作區</h3>
        </div>
        <div>
          <p className="text-sm text-text-secondary">移除用戶資料（匿名化）</p>
          <p className="text-xs text-text-muted mt-1">
            此操作將清除用戶的姓名、Email 及頭像，並同時停權。遊戲紀錄與訂單資料會保留以維持統計完整性。此操作<span className="font-semibold" style={{ color: 'var(--color-danger)' }}>不可逆</span>。
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder={confirmPlaceholder}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
          <Button
            variant="danger"
            size="sm"
            disabled={!isConfirmMatch || actionLoading}
            onClick={() => void handleAnonymize()}
          >
            <Trash2 size={14} />確認移除
          </Button>
        </div>
      </div>
    </div>
  )
}
