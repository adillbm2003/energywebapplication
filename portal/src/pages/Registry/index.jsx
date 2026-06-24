import { useState, useMemo, useEffect } from 'react'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SearchBar from '../../components/common/SearchBar'
import Select from '../../components/ui/Select'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useDebounce } from '../../hooks/useDebounce'
import { usePagination } from '../../hooks/usePagination'
import { registryService } from '../../services'
import { filterBySearch, filterByField } from '../../utils/filter'
import { formatDate, formatNumber } from '../../utils/format'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

function SolarStats() {
  const [solar, setSolar] = useState(null)

  useEffect(() => {
    fetch('/api/solar/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setSolar(d))
      .catch(() => {})
  }, [])

  if (!solar) return null

  const DISTRICT_COLORS = ['#0f766e','#0891b2','#16a34a','#7c3aed','#f97316','#2563eb','#dc2626','#d97706','#6b7280','#0ea5e9','#84cc16']
  const maxDistrict = solar.byDistrict[0]?.count || 1
  const currentYear = new Date().getFullYear()
  const thisYear = solar.byYear.find(y => y.year === String(currentYear))

  return (
    <section className="section-padding bg-gradient-to-br from-amber-50 to-white border-b border-amber-100">
      <div className="container-page">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 mb-2">Live Data</span>
            <h2 className="text-xl font-bold text-navy-900">Solar Panel Applications — {solar.byYear[0]?.year} to Present</h2>
            <p className="text-sm text-slate-500 mt-1">Planning permits for solar PV installations island-wide · Last updated: {new Date(solar.fileLastModified).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'})}</p>
          </div>
          <a
            href={`${import.meta.env.BASE_URL}documents/Solar Panel Application 2019-now.xlsx`}
            download
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 transition-colors"
          >
            ⬇ Download Full Dataset
          </a>
        </div>

        {/* KPI row */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: '📋', label: 'Total Permit Applications', value: solar.total.toLocaleString(), sub: `Since ${solar.byYear[0]?.year}` },
            { icon: '✅', label: 'Active Installations', value: solar.activeInstalls.toLocaleString(), sub: 'Complete + Issued + Under Construction' },
            { icon: '⚡', label: 'Est. Total Capacity', value: `${(solar.totalKWExtracted / 1000).toFixed(1)} MW`, sub: `Extracted from ${solar.kWDataPoints} permit descriptions` },
            { icon: '📅', label: `Permits in ${currentYear}`, value: (thisYear?.count || 0).toString(), sub: 'Year-to-date applications' },
          ].map(k => (
            <div key={k.label} className="rounded-xl border border-amber-200 bg-white p-5 card-shadow">
              <span className="text-2xl">{k.icon}</span>
              <div className="mt-2 text-2xl font-bold text-amber-700">{k.value}</div>
              <div className="mt-0.5 text-sm font-semibold text-navy-900">{k.label}</div>
              <div className="mt-0.5 text-xs text-slate-500">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Applications by year */}
          <div className="rounded-xl border border-slate-200 bg-white card-shadow p-5">
            <h3 className="mb-4 text-sm font-bold text-navy-900 uppercase tracking-wide">Applications Per Year</h3>
            <div className="space-y-2">
              {solar.byYear.map(({ year, count }) => (
                <div key={year}>
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{year}</span>
                    <span className="font-bold text-navy-900">{count}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${(count / Math.max(...solar.byYear.map(y=>y.count))) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By district */}
          <div className="rounded-xl border border-slate-200 bg-white card-shadow p-5">
            <h3 className="mb-4 text-sm font-bold text-navy-900 uppercase tracking-wide">By Parish / District</h3>
            <div className="space-y-2">
              {solar.byDistrict.map(({ district, count }, i) => (
                <div key={district}>
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{district}</span>
                    <span className="font-bold text-navy-900">{count}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxDistrict) * 100}%`, backgroundColor: DISTRICT_COLORS[i % DISTRICT_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status + Work class */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 bg-white card-shadow p-5">
              <h3 className="mb-3 text-sm font-bold text-navy-900 uppercase tracking-wide">By Permit Status</h3>
              <div className="space-y-1.5">
                {solar.byStatus.map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      status === 'Complete' ? 'bg-green-100 text-green-800' :
                      status === 'Issued' ? 'bg-blue-100 text-blue-800' :
                      status === 'Under Construction' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-600'}`}>{status}</span>
                    <span className="font-bold text-navy-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white card-shadow p-5">
              <h3 className="mb-3 text-sm font-bold text-navy-900 uppercase tracking-wide">Residential vs Commercial</h3>
              {solar.byWorkClass.map(({ type, count }) => (
                <div key={type} className="flex items-center justify-between text-sm py-1">
                  <span className="font-medium text-slate-700">{type}</span>
                  <span className="font-bold text-navy-900">{count} <span className="text-xs text-slate-400">({((count/solar.total)*100).toFixed(1)}%)</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Registry() {
  useDocumentTitle('Renewable Energy Registry')

  const [search, setSearch] = useState('')
  const [parish, setParish] = useState('all')
  const [type, setType] = useState('all')
  const debouncedSearch = useDebounce(search)

  const { data: entries, loading } = useAsyncData(() => registryService.getAll(), [])
  const { data: parishes } = useAsyncData(() => registryService.getParishes(), [])
  const { data: types } = useAsyncData(() => registryService.getTypes(), [])

  const filtered = useMemo(() => {
    if (!entries) return []
    let result = filterByField(entries, 'parish', parish)
    result = filterByField(result, 'type', type)
    return filterBySearch(result, debouncedSearch, ['name', 'id', 'installer', 'parish'])
  }, [entries, parish, type, debouncedSearch])

  const { items, page, totalPages, setPage, resetPage } = usePagination(filtered, 10)

  useEffect(() => { resetPage() }, [debouncedSearch, parish, type, resetPage])

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Parish', 'Type', 'Capacity (kW)', 'Status', 'Install Date', 'Installer'].join(','),
      ...filtered.map((e) =>
        [e.id, e.name, e.parish, e.type, e.capacity, e.status, e.installDate, e.installer].join(','),
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bermuda-renewable-registry.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <LoadingSpinner />

  return (
    <>
      <PageBanner
        title="Renewable Energy Registry"
        subtitle="Official register of renewable energy installations across Bermuda."
        breadcrumbs={[{ label: 'Registry', to: '/registry' }]}
        image={PAGE_IMAGES.dockyardSolar}
      />

      <SolarStats />

      <section className="section-padding">
        <div className="container-page">
          <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
            <img src={PAGE_IMAGES.dockyardSolar} alt="" className="aspect-[21/7] w-full object-cover" loading="lazy" />
          </div>

          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="grid flex-1 gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search registry?" label="Search registry" />
              </div>
              <Select
                label="Parish"
                name="parish"
                value={parish}
                onChange={(e) => setParish(e.target.value)}
                options={[{ value: 'all', label: 'All Parishes' }, ...(parishes ?? []).map((p) => ({ value: p, label: p }))]}
              />
              <Select
                label="Type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[{ value: 'all', label: 'All Types' }, ...(types ?? []).map((t) => ({ value: t, label: t }))]}
              />
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Export CSV
            </button>
          </div>

          {items.length === 0 ? (
            <EmptyState title="No registry entries found" />
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500" aria-live="polite">
                {filtered.length} installation{filtered.length !== 1 ? 's' : ''} registered
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white card-shadow">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-700">ID</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-700">Name</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-700">Parish</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-700">Type</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-700">Capacity</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-700">Status</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-700">Installed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{entry.id}</td>
                        <td className="px-4 py-3 font-medium text-navy-900">{entry.name}</td>
                        <td className="px-4 py-3 text-slate-600">{entry.parish}</td>
                        <td className="px-4 py-3"><Badge variant="gold">{entry.type}</Badge></td>
                        <td className="px-4 py-3 text-slate-600">{formatNumber(entry.capacity)} kW</td>
                        <td className="px-4 py-3">
                          <Badge status={entry.status === 'Active' ? 'In Force' : 'In Development'}>{entry.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(entry.installDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
            </>
          )}
        </div>
      </section>
    </>
  )
}
