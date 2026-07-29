import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

export default function Breadcrumb({ items = [], dark = false }) {
  const crumbs = [{ label: 'Home', to: ROUTES.home }, ...items]

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs">
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <li key={item.to || item.label} className="flex items-center gap-1">
              {index > 0 && (
                <svg className={dark ? 'h-3 w-3 text-white/30' : 'h-3 w-3 text-slate-300'} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {isLast ? (
                <span className={dark ? 'font-semibold text-white/90' : 'font-semibold text-navy-900'} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className={dark ? 'text-white/50 hover:text-white/80 transition-colors' : 'text-slate-500 hover:text-teal-600 transition-colors'}
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
