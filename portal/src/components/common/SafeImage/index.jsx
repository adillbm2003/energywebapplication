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
        if (event.currentTarget.src !== fallback) {
          event.currentTarget.src = fallback
        }
      }}
      {...props}
    />
  )
}
