import { cn } from '../../utils/cn'

export default function Select({ label, id, options = [], className, ...props }) {
  const selectId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 transition-colors focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20',
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
