import { useState, useMemo, useEffect } from 'react'

import PageBanner from '../../components/common/PageBanner'

import SearchBar from '../../components/common/SearchBar'

import Select from '../../components/ui/Select'

import PolicyCard from '../../components/cards/PolicyCard'

import Pagination from '../../components/ui/Pagination'

import EmptyState from '../../components/ui/EmptyState'

import { CardSkeleton } from '../../components/ui/Skeleton'

import { PAGE_IMAGES } from '../../constants/branding'

import { useDocumentTitle } from '../../hooks/useDocumentTitle'

import { useAsyncData } from '../../hooks/useAsyncData'

import { useDebounce } from '../../hooks/useDebounce'

import { usePagination } from '../../hooks/usePagination'

import { policyService } from '../../services'

import { filterBySearch, filterByField } from '../../utils/filter'

import { EXTERNAL_LINKS } from '../../constants/externalLinks'



export default function Policies() {

  useDocumentTitle('Policies, Legislation & Publications')



  const [search, setSearch] = useState('')

  const [category, setCategory] = useState('all')

  const debouncedSearch = useDebounce(search)



  const { data: policies, loading } = useAsyncData(() => policyService.getAll(), [])

  const { data: categories } = useAsyncData(() => policyService.getCategories(), [])



  const filtered = useMemo(() => {

    if (!policies) return []

    let result = filterByField(policies, 'category', category)

    result = filterBySearch(result, debouncedSearch, ['title', 'summary', 'tags'])

    return result

  }, [policies, category, debouncedSearch])



  const { items, page, totalPages, setPage, resetPage } = usePagination(filtered, 6)



  useEffect(() => { resetPage() }, [debouncedSearch, category, resetPage])



  const categoryOptions = [

    { value: 'all', label: 'All Categories' },

    ...(categories ?? []).map((c) => ({ value: c, label: c })),

  ]



  return (

    <>

      <PageBanner

        title="Policies, Legislation & Publications"

        subtitle="Searchable repository of energy policy documents, legislation, and publications."

        breadcrumbs={[{ label: 'Policies', to: '/policies' }]}

        image={PAGE_IMAGES.government}

      />



      <section className="section-padding">

        <div className="container-page">

          {/* Legislation notice */}
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
            For full legislation and statutes, visit{' '}
            <a
              href={EXTERNAL_LINKS.bermudaLaws}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-blue-900"
            >
              www.bermudalaws.bm
            </a>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">

            <div className="md:col-span-2">

              <SearchBar

                value={search}

                onChange={(e) => setSearch(e.target.value)}

                placeholder="Search policies, legislation, publications..."

                label="Search repository"

              />

            </div>

            <Select

              label="Category"

              name="category"

              value={category}

              onChange={(e) => setCategory(e.target.value)}

              options={categoryOptions}

            />

          </div>



          {loading ? (

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

            </div>

          ) : items.length === 0 ? (

            <EmptyState

              title="No documents found"

              description="Try adjusting your search or filter criteria."

            />

          ) : (

            <>

              <p className="mb-4 text-body-small text-slate-500" aria-live="polite">

                Showing {filtered.length} document{filtered.length !== 1 ? 's' : ''}

              </p>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {items.map((policy) => <PolicyCard key={policy.id} policy={policy} />)}

              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />

            </>

          )}

        </div>

      </section>

    </>

  )

}

