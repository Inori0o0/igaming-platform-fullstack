import { cn } from '@/lib/utils'

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableRow({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-border-subtle transition-colors',
        onClick && 'cursor-pointer hover:bg-surface-elevated',
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 text-text-primary', className)}>
      {children}
    </td>
  )
}

export function TableEmpty({ message = '暫無資料' }: { message?: string }) {
  return (
    <tr>
      <td colSpan={999} className="py-16 text-center text-text-muted">
        {message}
      </td>
    </tr>
  )
}
