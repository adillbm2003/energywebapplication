import { Link } from 'react-router-dom'
import { BRANDING } from '../../../constants/branding'
import { ROUTES } from '../../../constants/routes'
import { cn } from '../../../utils/cn'

/**
 * Department of Energy lockup.
 *
 * BRANDING.logo is the official horizontal lockup — crest plus the words
 * "Department of Energy" in white, on a transparent background, roughly 4.2:1.
 *
 * It is rendered directly on the dark navy header and footer at its natural
 * aspect ratio. Two things follow from the wordmark being part of the artwork:
 * it must not sit on a white panel (white text on white), and the department
 * name must not also be rendered as text beside it, or the site reads
 * "Department of Energy Department of Energy". The previous version did both,
 * because the asset then was a square crest with no wordmark.
 *
 * `compact` keeps the crest on its own for narrow, square contexts where the
 * full lockup would be illegible.
 */
export default function Logo({
  variant = 'header',
  className = '',
  linkTo = ROUTES.home,
  showTagline = true,
}) {
  const isCompact = variant === 'compact'
  const isFooter = variant === 'footer'

  if (isCompact) {
    return wrap(
      <img
        src={BRANDING.crest}
        alt={BRANDING.logoAlt}
        className={cn('h-10 w-10 shrink-0 object-contain', className)}
        width={40}
        height={40}
      />,
    )
  }

  const content = (
    <div className={cn('flex flex-col justify-center gap-1', className)}>
      <img
        src={BRANDING.logo}
        alt={BRANDING.logoAlt}
        className={cn(
          'w-auto shrink-0 object-contain object-left',
          isFooter ? 'h-12' : 'h-10 sm:h-12 lg:h-14',
        )}
        width={912}
        height={216}
      />
      {/* Only the domain. The lockup artwork already reads "GOVERNMENT OF
          BERMUDA / Department of Energy", so repeating the government name here
          printed it twice in the same block (three times in the header, which
          also carries it in the utility bar above). */}
      {showTagline && (
        <span className="hidden truncate text-xs text-slate-400 sm:block">
          {BRANDING.domain}
        </span>
      )}
    </div>
  )

  return wrap(content)

  function wrap(node) {
    if (!linkTo) return node
    return (
      <Link
        to={linkTo}
        className="transition-opacity hover:opacity-90"
        aria-label={`${BRANDING.departmentName} home`}
      >
        {node}
      </Link>
    )
  }
}
