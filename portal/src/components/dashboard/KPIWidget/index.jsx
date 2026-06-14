import { formatNumber } from '../../../utils/format'
import SafeImage from '../../common/SafeImage'

export default function KPIWidget({ label, value, unit, change, image }) {
  const isPositive = change > 0

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-0.5 hover:card-shadow-hover">
      <div className="absolute left-0 top-0 z-10 h-full w-1 bg-gradient-to-b from-[#2E5496] to-teal-500" aria-hidden="true" />
      {image && (
        <SafeImage src={image} alt="" className="h-24 w-full object-cover" />
      )}
      <div className="card-padding">
        <p className="pl-2 text-body-small font-medium text-slate-500">{label}</p>
        <p className="mt-1 pl-2 text-h2 font-bold text-navy-900">
          {typeof value === 'number' ? formatNumber(value) : value}
          {unit && <span className="ml-1 text-h4 font-semibold text-slate-500">{unit}</span>}
        </p>
        {change !== undefined && change !== null && change !== '' && (
          <p className={`mt-1 pl-2 text-body-small font-semibold ${isPositive ? 'text-success' : 'text-slate-500'}`}>
            {isPositive ? '↑' : ''} {change > 0 ? '+' : ''}{change}% YoY
          </p>
        )}
      </div>
    </div>
  )
}
