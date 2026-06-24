import { useState, useMemo } from 'react'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SearchBar from '../../components/common/SearchBar'
import Select from '../../components/ui/Select'
import ProjectCard from '../../components/cards/ProjectCard'
import EmptyState from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useDebounce } from '../../hooks/useDebounce'
import { projectService } from '../../services'
import { filterBySearch, filterByField } from '../../utils/filter'

export default function Projects() {
  useDocumentTitle('Energy Projects')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const debouncedSearch = useDebounce(search)

  const { data: projects, loading } = useAsyncData(() => projectService.getAll(), [])

  const categories = useMemo(() => {
    if (!projects) return []
    return [...new Set(projects.map((p) => p.category))]
  }, [projects])

  const filtered = useMemo(() => {
    if (!projects) return []
    let result = filterByField(projects, 'category', category)
    return filterBySearch(result, debouncedSearch, ['title', 'summary', 'location'])
  }, [projects, category, debouncedSearch])

  return (
    <>
      <PageBanner
        title="Energy Projects & Government Initiatives"
        subtitle="Major projects driving Bermuda's energy transition."
        breadcrumbs={[{ label: 'Projects', to: '/projects' }]}
        image={PAGE_IMAGES.govSolarField}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects?" label="Search projects" />
            </div>
            <Select
              label="Category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No projects found" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
