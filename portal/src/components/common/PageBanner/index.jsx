import Breadcrumb from '../Breadcrumb'
import { cn } from '../../../utils/cn'

export default function PageBanner({ title, subtitle, breadcrumbs = [], image, className = '', action, dark = false }) {
  if (dark) {
    return (
      <section className={cn('relative overflow-hidden bg-navy-900 text-white', className)}>
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-600 via-[#2E5496] to-gold-500" aria-hidden="true" />
        {image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${image})` }}
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/80 via-navy-900/60 to-teal-900/40" aria-hidden="true" />
        <div className="container-page relative py-10 md:py-14">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0 max-w-3xl">
              {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} dark />}
              <h1 className="mt-3 text-white">{title}</h1>
              {subtitle && <p className="mt-2.5 text-slate-300 leading-relaxed">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-600 via-[#2E5496] to-gold-500" aria-hidden="true" />

      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/60" aria-hidden="true" />

      {image && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.07]"
            style={{ backgroundImage: `url(${image})` }}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-0 hidden h-full w-5/12 overflow-hidden md:block"
            aria-hidden="true"
          >
            <img src={image} alt="" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-slate-50/70 to-transparent" />
          </div>
        </>
      )}

      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        aria-hidden="true"
      />

      <div className="container-page relative py-9 md:py-11">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 max-w-2xl">
            {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
            <h1 className="mt-2.5 leading-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 max-w-xl text-body-small text-slate-600 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 md:pt-7">{action}</div>}
        </div>
      </div>
    </section>
  )
}
