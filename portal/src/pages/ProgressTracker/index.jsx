import { useState, useMemo } from 'react'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SearchBar from '../../components/common/SearchBar'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import EmptyState from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useDebounce } from '../../hooks/useDebounce'
import { policyService } from '../../services'
import { filterBySearch, filterByField, sortItems } from '../../utils/filter'
import { POLICY_STATUSES, STATUS_PROGRESS } from '../../constants/statuses'
import { formatDate } from '../../utils/format'
import SafeImage from '../../components/common/SafeImage'
import { resolveContentImage } from '../../utils/contentImages'

const SECTORS = ['Energy', 'Telecommunications', 'Space and Satellite', 'Renewable Energy', 'Fuels']

export default function ProgressTracker() {
  useDocumentTitle('Policy & Legislation Progress Tracker')

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sector, setSector] = useState('all')
  const [sortBy, setSortBy] = useState('lastUpdated')
  const [sortDir, setSortDir] = useState('desc')
  const debouncedSearch = useDebounce(search)

  const { data: tracker, loading } = useAsyncData(() => policyService.getTracker(), [])

  const filtered = useMemo(() => {
    if (!tracker) return []
    let result = filterByField(tracker, 'status', status)
    result = filterByField(result, 'sector', sector)
    result = filterBySearch(result, debouncedSearch, ['title', 'category', 'department', 'summary', 'stage'])
    return sortItems(result, sortBy, sortDir)
  }, [tracker, status, sector, debouncedSearch, sortBy, sortDir])

  return (
    <>
      <PageBanner
        title="Policy & Legislation Progress Tracker"
        subtitle="Track the development, consultation, approval, and implementation status of policies and legislation."
        breadcrumbs={[{ label: 'Progress Tracker', to: '/progress-tracker' }]}
        image={PAGE_IMAGES.consultation}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search initiatives?" label="Search tracker" />
            </div>
            <Select label="Status" name="status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'all', label: 'All Statuses' }, ...POLICY_STATUSES.map((s) => ({ value: s, label: s }))]} />
            <Select label="Sector" name="sector" value={sector} onChange={(e) => setSector(e.target.value)} options={[{ value: 'all', label: 'All Sectors' }, ...SECTORS.map((s) => ({ value: s, label: s }))]} />
          </div>
          <div className="mb-6 max-w-xs">
            <Select
              label="Sort By"
              name="sort"
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => { const [f, d] = e.target.value.split('-'); setSortBy(f); setSortDir(d) }}
              options={[
                { value: 'lastUpdated-desc', label: 'Recently Updated' },
                { value: 'title-asc', label: 'Title A?Z' },
                { value: 'progress-desc', label: 'Progress (High?Low)' },
              ]}
            />
          </div>

          {loading ? (
            <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No initiatives found" description="Adjust your search or filters." />
          ) : (
            <div className="space-y-4" role="list">
              {filtered.map((item) => (
                <article key={item.id} role="listitem" className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-shadow hover:card-shadow-hover">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 shrink-0">
                      <SafeImage
                        src={resolveContentImage(item.image, 'progress')}
                        alt=""
                        className="h-36 w-full object-cover sm:h-full sm:min-h-[140px]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col card-padding">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="gold">{item.sector || item.category}</Badge>
                        <Badge>{item.type}</Badge>
                        <Badge status={item.status}>{item.status}</Badge>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-navy-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.department} ? Stage: {item.stage}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>Updated {formatDate(item.lastUpdated)}</p>
                      {item.consultationClose && <p className="mt-1">Consultation closes {formatDate(item.consultationClose)}</p>}
                      <p className="mt-1 font-medium text-teal-700">{item.nextMilestone}</p>
                    </div>
                  </div>
                  <ProgressBar value={item.progress ?? STATUS_PROGRESS[item.status] ?? 0} label="Progress" className="mt-4" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
