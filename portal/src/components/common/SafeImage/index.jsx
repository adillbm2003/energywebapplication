import { IMAGE_FALLBACK } from '../../../constants/branding'
import { cn } from '../../../utils/cn'

export default function SafeImage({
  src,
  alt = '',
  className,
  fallback = IMAGE_FALLBACK,
  loading = 'lazy',
  ...props
}) {
  const imageSrc = src || fallback

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={cn(className)}
      loading={loading}
      onError={(event) => {
        const img = event.currentTarget
        // Guard against an infinite loop when the fallback image itself 404s.
        if (img.dataset.fallbackApplied) return
        img.dataset.fallbackApplied = 'true'
        img.src = fallback
      }}
      {...props}
    />
  )
}
