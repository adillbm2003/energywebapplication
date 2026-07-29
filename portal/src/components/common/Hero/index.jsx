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
      className={`relative overflow-hidden bg-navy-900 text-white ${compact ? 'py-12 md:py-16' : 'py-16 md:py-24 lg:py-28'}`}
      aria-labelledby="hero-title"
    >
      {/* Background image */}
      {bg && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
          style={{ backgroundImage: `url(${bg})` }}
          aria-hidden="true"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/80 to-teal-950/70" aria-hidden="true" />

      {/* Decorative orbs */}
      <div className="absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[80px]" aria-hidden="true" />
      <div className="absolute -left-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#2E5496]/15 blur-[80px]" aria-hidden="true" />
      <div className="absolute top-0 right-1/3 h-[200px] w-[200px] rounded-full bg-gold-500/8 blur-[60px]" aria-hidden="true" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        aria-hidden="true"
      />

      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {/* Government badge */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" aria-hidden="true" />
              {BRANDING.governmentName} · {BRANDING.departmentName}
            </span>
          </motion.div>

          <h1 id="hero-title" className="text-display text-white leading-[1.15]">
            {title}
          </h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-4 max-w-2xl text-base text-slate-200/85 leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}

          {(ctaLabel || secondaryLabel) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              {ctaLabel && ctaTo && (
                <Button to={ctaTo} variant="gold" size="lg" className="shadow-lg shadow-gold-500/20">
                  {ctaLabel}
                </Button>
              )}
              {secondaryLabel && secondaryTo && (
                <Button
                  to={secondaryTo}
                  variant="outline"
                  size="lg"
                  className="border-white/40 text-white hover:bg-white/10 hover:border-white/60"
                >
                  {secondaryLabel}
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Scroll hint */}
        {!compact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 translate-y-8 md:flex flex-col items-center gap-1"
          >
            <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
            <svg className="h-4 w-4 text-white/25 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        )}
      </div>
    </section>
  )
}
