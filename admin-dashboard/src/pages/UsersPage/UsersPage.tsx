import { useNavigate } from 'react-router-dom'
import { Search, UserX, UserCheck, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty } from '@/components/ui/Table'
import { useUserList } from './hooks/useUserList'

export function UsersPage() {
  const navigate = useNavigate()
  const { users, total, page, setPage, search, setSearch, loading, totalPages, refetch, banUser, unbanUser, actionLoading } = useUserList()

  async function handleBan(userId: string, displayName: string | null) {
    if (!window.confirm(`確定要停權「${displayName ?? userId}」嗎？`)) return
    await banUser(userId)
  }

  async function handleUnban(userId: string, displayName: string | null) {
    if (!window.confirm(`確定要解除「${displayName ?? userId}」的停權嗎？`)) return
    await unbanUser(userId)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <Input placeholder="搜尋 Email 或名稱..." icon={<Search size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="secondary" size="sm" onClick={() => void refetch()}>
          <RefreshCw size={14} />重新整理
        </Button>
        <p className="text-sm text-text-muted ml-auto">
          共 <span className="text-text-primary font-medium">{total}</span> 筆
        </p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用戶</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>註冊時間</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 rounded bg-surface-elevated animate-pulse w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableEmpty message="找不到用戶" />
            ) : (
              users.map((user) => {
                const isBanned = Boolean(user.banned_at)
                const isActioning = actionLoading === user.id
                return (
                  <TableRow
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    className={isBanned ? 'opacity-60' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-background shrink-0"
                          style={{ background: isBanned ? 'var(--color-danger)' : 'var(--color-gold)' }}
                        >
                          {(user.display_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{user.display_name ?? '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-text-secondary">{user.email ?? '—'}</span></TableCell>
                    <TableCell>
                      {user.is_guest ? <Badge variant="warning">訪客</Badge> : <Badge variant="success">正式用戶</Badge>}
                    </TableCell>
                    <TableCell>
                      {isBanned
                        ? <Badge variant="danger">已停權</Badge>
                        : <Badge variant="default">正常</Badge>
                      }
                    </TableCell>
                    <TableCell><span className="text-xs text-text-muted">{formatDate(user.created_at)}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {isBanned ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="解除停權"
                            disabled={isActioning}
                            onClick={() => void handleUnban(user.id, user.display_name)}
                          >
                            <UserCheck size={14} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="停權"
                            disabled={isActioning}
                            onClick={() => void handleBan(user.id, user.display_name)}
                          >
                            <UserX size={14} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>上一頁</Button>
          <span className="text-sm text-text-muted">第 {page + 1} / {totalPages} 頁</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>下一頁</Button>
        </div>
      )}
    </div>
  )
}
