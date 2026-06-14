export default function ProgressBar({ value, label, showLabel = true, className = '' }) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={className}>
      {showLabel && label && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="text-slate-500">{clamped}%</span>
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progress: ${clamped}%`}
      >
        <div
          className="h-full rounded-full bg-teal-600 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
