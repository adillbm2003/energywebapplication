import Breadcrumb from '../Breadcrumb'
import { cn } from '../../../utils/cn'

export default function PageBanner({ title, subtitle, breadcrumbs = [], image, className = '', action }) {
  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-teal-50/40',
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2E5496] via-teal-600 to-gold-500" aria-hidden="true" />

      {image && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.14]"
            style={{ backgroundImage: `url(${image})` }}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 hidden h-full w-2/5 overflow-hidden md:block" aria-hidden="true">
            <img src={image} alt="" className="h-full w-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent" />
          </div>
        </>
      )}

      <div className="container-page relative py-7 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <Breadcrumb items={breadcrumbs} />
            <h1 className="mt-2 max-w-3xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-body-small text-slate-600">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 md:pt-6">{action}</div>}
        </div>
      </div>
    </section>
  )
}
