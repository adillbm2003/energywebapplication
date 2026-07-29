import { Link } from 'react-router-dom'
import { BRANDING } from '../../../constants/branding'
import { ROUTES } from '../../../constants/routes'
import { cn } from '../../../utils/cn'

export default function Logo({
  variant = 'full',
  className = '',
  linkTo = ROUTES.home,
  showText = true,
}) {
  const isCompact = variant === 'compact'
  const isFooter = variant === 'footer'
  const isHeader = variant === 'header'

  const content = (
    <div className={cn('flex items-center gap-2 lg:gap-3', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden bg-white',
          isCompact
            ? 'h-10 w-10 rounded-md p-0.5'
            : isHeader
            ? 'h-14 w-14 rounded-lg p-0.5 lg:h-16 lg:w-16'
            : isFooter
              ? 'h-16 w-16 rounded-lg p-1'
              : 'h-14 w-14 rounded-lg p-1 sm:h-16 sm:w-16',
        )}
      >
        <img
          src={BRANDING.logo}
          alt={BRANDING.logoAlt}
          className="h-full w-full object-contain"
          width={isCompact ? 40 : 56}
          height={isCompact ? 40 : 56}
        />
      </div>
      {showText && !isCompact && (
        <div className={cn(isFooter ? 'text-left' : isHeader ? 'hidden min-w-0 sm:block' : 'hidden min-w-0 xl:block')}>
          <span
            className={cn(
              'block truncate font-bold leading-tight',
              isFooter ? 'text-sm text-white' : 'text-sm text-white',
            )}
          >
            {BRANDING.departmentName}
          </span>
          <span className={cn('block truncate text-xs', isFooter ? 'text-slate-400' : 'text-slate-400')}>
            {BRANDING.governmentName} · {BRANDING.domain}
          </span>
        </div>
      )}
    </div>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="transition-opacity hover:opacity-90" aria-label={`${BRANDING.departmentName} home`}>
        {content}
      </Link>
    )
  }

  return content
}
