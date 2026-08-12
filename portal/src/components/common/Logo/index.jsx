import { Link } from 'react-router-dom'
import { BRANDING } from '../../../constants/branding'
import { ROUTES } from '../../../constants/routes'
import { cn } from '../../../utils/cn'

/**
 * Where the wordmark starts inside the lockup artwork, as a fraction of the
 * image width: the crest runs to x=139 of 912, then a clear gutter, then
 * "GOVERNMENT OF BERMUDA" from x=198. Measured off the asset — re-measure if
 * the artwork is ever replaced.
 */
const WORDMARK_INSET = 198 / 912

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

  // w-fit so the block shrink-wraps the lockup. The tagline's indent below is a
  // percentage, which resolves against this box — without w-fit the footer would
  // size it to the whole grid column and throw the indent far to the right.
  const content = (
    <div className={cn('flex w-fit flex-col justify-center gap-1', className)}>
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
      {/* The domain, hung off the wordmark rather than the image box. The crest
          fills the left fifth of the artwork, so the words inside the image
          start well right of the image's own left edge; aligning this to that
          edge parked it under the crest, out of line with the wordmark above.
          The indent is a fraction of the image width, so it holds at every logo
          height rather than needing a value per breakpoint.

          Only the domain is printed. The artwork already reads "GOVERNMENT OF
          BERMUDA / Department of Energy", so repeating the government name here
          set it twice in one block (three times in the header, which also
          carries it in the utility bar above). */}
      {showTagline && (
        <span
          className="hidden truncate text-xs text-slate-400 sm:block"
          style={
            // Header only. In the footer the lockup heads a left-aligned column
            // — description, phone — so indenting the domain would leave it the
            // one item out of line with the column it belongs to.
            isFooter ? undefined : { paddingLeft: `${(WORDMARK_INSET * 100).toFixed(2)}%` }
          }
        >
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
