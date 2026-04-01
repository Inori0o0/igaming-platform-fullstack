import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full rounded-md border border-border bg-surface-elevated',
          'px-3 py-2 text-sm text-text-primary',
          'focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold',
          'transition-colors',
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-elevated">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
