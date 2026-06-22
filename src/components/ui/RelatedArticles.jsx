export default function RelatedArticles({ articles, heading = 'In the News' }) {
  if (!articles || articles.length === 0) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{heading}</p>
      <ul className="space-y-2">
        {articles.map((a) => (
          <li key={a.url} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
            <div className="min-w-0">
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-teal-700 hover:text-teal-900 hover:underline leading-snug"
              >
                {a.title}
              </a>
              {(a.source || a.date) && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {a.source}{a.source && a.date ? ' · ' : ''}{a.date ? new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
