import Button from './Button'

export default function Pagination({ page, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  )

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        Previous
      </Button>

      {visiblePages.map((p, idx) => {
        const prev = visiblePages[idx - 1]
        const showEllipsis = prev && p - prev > 1

        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-2 text-slate-400" aria-hidden="true">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={`min-w-[2.25rem] rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          </span>
        )
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next
      </Button>
    </nav>
  )
}
