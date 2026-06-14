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
        image={PAGE_IMAGES.registry}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
            <img src={PAGE_IMAGES.registry} alt="" className="aspect-[21/7] w-full object-cover" loading="lazy" />
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
