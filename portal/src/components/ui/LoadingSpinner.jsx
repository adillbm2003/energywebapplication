export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
      <span className="sr-only">{label}</span>
      <p className="mt-4 text-sm text-slate-500">{label}…</p>
    </div>
  )
}
