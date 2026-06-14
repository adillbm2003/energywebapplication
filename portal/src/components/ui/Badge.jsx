import { cn } from '../../utils/cn'
import { STATUS_COLORS } from '../../constants/statuses'

export default function Badge({ children, status, className, variant }) {
  const colorClass = status
    ? STATUS_COLORS[status] || 'bg-slate-100 text-slate-700'
    : variant === 'gold'
      ? 'bg-gold-100 text-gold-600'
      : 'bg-teal-100 text-teal-800'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        colorClass,
        className,
      )}
    >
      {children}
    </span>
  )
}
