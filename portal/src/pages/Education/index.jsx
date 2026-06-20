import { useState, useMemo } from 'react'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
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

const CATEGORIES = [
  { value: 'all', label: 'All Resources' },
  { value: 'Appliance Guides', label: '🔌 Appliance Guides' },
  { value: 'Renewable Energy', label: '☀️ Renewable Energy' },
]

function ResourceCard({ resource }) {
  const isGuide = resource.type === 'Infographic'
  const imgSrc = isGuide ? resource.image : resolveContentImage(resource.image, 'education')
  const hasLocalFile = resource.downloadUrl && resource.downloadUrl !== '#' && !isExternalUrl(resource.downloadUrl)

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-0.5 hover:card-shadow-hover">
      <div className={`relative overflow-hidden ${isGuide ? 'aspect-[3/4]' : 'h-40'}`}>
        <SafeImage
          src={imgSrc}
          alt={resource.title}
          className="h-full w-full object-cover object-top"
        />
        {isGuide && (
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
        )}
        <div className="absolute bottom-2 left-2 flex gap-1">
          <Badge>{resource.category}</Badge>
          <Badge variant="gold">{resource.type}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-navy-900 leading-snug">{resource.title}</h3>
        <p className="mt-2 flex-1 text-sm text-slate-600 leading-relaxed">{resource.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {resource.downloadUrl && resource.downloadUrl !== '#' && (
            isExternalUrl(resource.downloadUrl) ? (
              <Button href={resource.downloadUrl} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">
                {isGuide ? '🖼️ View Infographic' : `Download${resource.fileSize ? ` (${resource.fileSize})` : ''}`}
              </Button>
            ) : hasLocalFile ? (
              <a
                href={resource.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {isGuide ? '🖼️ View Infographic' : `⬇ Download${resource.fileSize ? ` (${resource.fileSize})` : ''}`}
              </a>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadMockDocument({ title: resource.title, summary: resource.description, category: resource.category, content: resource.content })}
              >
                ⬇ Download PDF
              </Button>
            )
          )}
          {resource.downloadUrl === '#' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadMockDocument({ title: resource.title, summary: resource.description, category: resource.category, content: resource.content })}
            >
              ⬇ Download PDF
            </Button>
          )}
          {resource.videoUrl && (
            isExternalUrl(resource.videoUrl) ? (
              <Button href={resource.videoUrl} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">
                ▶ Watch Video {resource.duration && `(${resource.duration})`}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadMockDocument({ title: resource.title, summary: resource.description, category: 'Video Transcript' })}
              >
                ▶ Watch Video {resource.duration && `(${resource.duration})`}
              </Button>
            )
          )}
        </div>
      </div>
    </article>
  )
}

export default function Education() {
  useDocumentTitle('Education Centre')

  const [category, setCategory] = useState('all')
  const { data: resources, loading } = useAsyncData(() => educationService.getAll(), [])

  const filtered = useMemo(() => {
    if (!resources) return []
    return filterByField(resources, 'category', category)
  }, [resources, category])

  if (loading) return <LoadingSpinner />

  return (
    <>
      <PageBanner
        title="Education & Public Awareness Centre"
        subtitle="Official energy guides, infographics, and learning resources from the Department of Energy."
        breadcrumbs={[{ label: 'Education', to: '/education' }]}
        image={PAGE_IMAGES.education}
      />

      <section className="section-padding">
        <div className="container-page">
          {/* Category filter pills */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Count */}
          <p className="mb-4 text-sm text-slate-500">
            Showing {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
            {category !== 'all' && ` in "${CATEGORIES.find(c => c.value === category)?.label}"`}
          </p>

          {filtered.length === 0 ? (
            <EmptyState title="No resources found" />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Energy Guide highlight banner */}
      <section className="section-padding bg-gradient-to-br from-navy-900 to-teal-900 text-white">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div>
              <span className="inline-block rounded-full bg-gold-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-navy-900 mb-3">
                Official Guides
              </span>
              <h2 className="text-white text-2xl font-bold leading-snug">
                Department of Energy<br />Consumer Energy Guides
              </h2>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                Bermuda's Department of Energy has produced a full series of energy guides covering every major appliance and renewable technology. Each guide provides tailored advice for Bermuda's high-electricity-cost environment.
              </p>
              <ul className="mt-4 space-y-1 text-sm text-slate-300">
                <li>✅ Air Conditioners · Refrigerators · Washing Machines</li>
                <li>✅ Televisions · Computers · Lighting · Space Heaters</li>
                <li>✅ Solar PV · Solar Water Heaters · Micro-Wind Turbines</li>
                <li>✅ Electric Vehicles · Water Heaters</li>
              </ul>
              <div className="mt-5">
                <Button
                  onClick={() => setCategory('Appliance Guides')}
                  variant="gold"
                >
                  Browse Appliance Guides
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 opacity-90">
              {['☀️ Solar PV', '❄️ Air Con', '💡 Lighting', '🚗 EVs', '🌬️ Wind', '🚿 Water Heater'].map((item) => (
                <div key={item} className="flex items-center justify-center rounded-xl bg-white/10 py-4 text-center text-sm font-medium text-white backdrop-blur-sm border border-white/10">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
