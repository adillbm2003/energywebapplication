export default function EmptyState({ title = 'No results found', description, icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      {icon && <div className="mb-4 text-4xl text-slate-300" aria-hidden="true">{icon}</div>}
      <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>}
    </div>
  )
}
