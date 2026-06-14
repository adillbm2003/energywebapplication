import { useState, useMemo, useEffect } from 'react'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SearchBar from '../../components/common/SearchBar'
import Select from '../../components/ui/Select'
import NewsCard from '../../components/cards/NewsCard'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import SectionHeading from '../../components/ui/SectionHeading'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useDebounce } from '../../hooks/useDebounce'
import { usePagination } from '../../hooks/usePagination'
import { newsService } from '../../services'
import { filterBySearch, filterByField } from '../../utils/filter'

export default function News() {
  useDocumentTitle('News & Media')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const debouncedSearch = useDebounce(search)

  const { data: articles, loading } = useAsyncData(() => newsService.getAll(), [])
  const { data: categories } = useAsyncData(() => newsService.getCategories(), [])

  const featured = articles?.filter((a) => a.featured) ?? []

  const filtered = useMemo(() => {
    if (!articles) return []
    let result = filterByField(articles, 'category', category)
    return filterBySearch(result, debouncedSearch, ['title', 'excerpt', 'category'])
  }, [articles, category, debouncedSearch])

  const { items, page, totalPages, setPage, resetPage } = usePagination(filtered, 6)

  useEffect(() => { resetPage() }, [debouncedSearch, category, resetPage])

  return (
    <>
      <PageBanner
        title="News & Media Centre"
        subtitle="Latest news, announcements, and media from the Department of Energy."
        breadcrumbs={[{ label: 'News', to: '/news' }]}
        image={PAGE_IMAGES.energy}
      />

      {featured.length > 0 && (
        <section className="section-padding bg-white" aria-labelledby="featured-heading">
          <div className="container-page">
            <SectionHeading title="Featured" />
            <div className="grid gap-4 md:grid-cols-2">
              {featured.slice(0, 2).map((article) => <NewsCard key={article.id} article={article} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section-padding">
        <div className="container-page">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search news?" label="Search news" />
            </div>
            <Select
              label="Category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...(categories ?? []).map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState title="No articles found" />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((article) => <NewsCard key={article.id} article={article} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-8" />
            </>
          )}
        </div>
      </section>
    </>
  )
}
