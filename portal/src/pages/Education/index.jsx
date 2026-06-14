import { useState, useMemo } from 'react'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { educationService } from '../../services'
import { filterByField } from '../../utils/filter'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import SafeImage from '../../components/common/SafeImage'
import { resolveContentImage } from '../../utils/contentImages'
import { downloadMockDocument, isExternalUrl } from '../../utils/mockDownload'

export default function Education() {
  useDocumentTitle('Education Centre')

  const [category, setCategory] = useState('all')
  const { data: resources, loading } = useAsyncData(() => educationService.getAll(), [])
  const { data: categories } = useAsyncData(() => educationService.getCategories(), [])

  const filtered = useMemo(() => {
    if (!resources) return []
    return filterByField(resources, 'category', category)
  }, [resources, category])

  if (loading) return <LoadingSpinner />

  return (
    <>
      <PageBanner
        title="Education & Public Awareness Centre"
        subtitle="Learning resources on renewable energy, efficiency, EVs, sustainability, and space STEM."
        breadcrumbs={[{ label: 'Education', to: '/education' }]}
        image={PAGE_IMAGES.education}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="mb-8 max-w-xs">
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

          {filtered.length === 0 ? (
            <EmptyState title="No resources found" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((resource) => (
                <article key={resource.id} className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow">
                  <SafeImage
                    src={resolveContentImage(resource.image, 'education')}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge>{resource.category}</Badge>
                      <Badge variant="gold">{resource.type}</Badge>
                    </div>
                    <h3 className="font-semibold text-navy-900">{resource.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600">{resource.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {resource.relatedRoute && (
                        <Button to={resource.relatedRoute} variant="primary" size="sm">
                          Explore topic
                        </Button>
                      )}
                      {resource.downloadUrl && (
                        isExternalUrl(resource.downloadUrl) ? (
                          <Button href={resource.downloadUrl} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">
                            Download {resource.fileSize && `(${resource.fileSize})`}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadMockDocument({ title: resource.title, summary: resource.description, category: resource.category })}
                          >
                            Download {resource.fileSize && `(${resource.fileSize})`}
                          </Button>
                        )
                      )}
                      {resource.videoUrl && (
                        isExternalUrl(resource.videoUrl) ? (
                          <Button href={resource.videoUrl} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">
                            Watch Video {resource.duration && `(${resource.duration})`}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadMockDocument({ title: resource.title, summary: resource.description, category: 'Video Transcript' })}
                          >
                            Watch Video {resource.duration && `(${resource.duration})`}
                          </Button>
                        )
                      )}
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
