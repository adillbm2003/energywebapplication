import { motion } from 'framer-motion'
import Button from '../../ui/Button'
import { BRANDING } from '../../../constants/branding'
import heroImage from '../../../assets/hero.png'

export default function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaTo,
  secondaryLabel,
  secondaryTo,
  backgroundImage,
  compact = false,
  useDefaultImage = false,
}) {
  const bg = backgroundImage || (useDefaultImage ? heroImage : null)

  return (
    <section
      className={`relative overflow-hidden bg-navy-900 text-white ${compact ? 'py-12 md:py-14' : 'py-14 md:py-20 lg:py-24'}`}
      aria-labelledby="hero-title"
    >
      {bg && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${bg})` }}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-navy-900/75 to-teal-900/60" aria-hidden="true" />
      <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl" aria-hidden="true" />
      <div className="absolute -left-24 bottom-1/4 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" aria-hidden="true" />

      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">
            {BRANDING.governmentName} · {BRANDING.departmentName}
          </p>
          <h1 id="hero-title" className="text-display text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-slate-200">{subtitle}</p>
          )}
          {(ctaLabel || secondaryLabel) && (
            <div className="mt-5 flex flex-wrap gap-3">
              {ctaLabel && ctaTo && <Button to={ctaTo} variant="primary" size="lg">{ctaLabel}</Button>}
              {secondaryLabel && secondaryTo && (
                <Button to={secondaryTo} variant="outline" size="lg" className="border-white/60 text-white hover:bg-white/10">
                  {secondaryLabel}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
