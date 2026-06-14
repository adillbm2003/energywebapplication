import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

export default function Breadcrumb({ items = [] }) {
  const crumbs = [{ label: 'Home', to: ROUTES.home }, ...items]

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <li key={item.to || item.label} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-slate-300" aria-hidden="true">/</span>
              )}
              {isLast ? (
                <span className="font-medium text-navy-900" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-teal-600 transition-colors">
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
