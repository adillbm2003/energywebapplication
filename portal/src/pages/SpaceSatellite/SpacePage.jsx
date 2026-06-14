import { useParams, Navigate, Link } from 'react-router-dom'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { spaceService } from '../../services'
import { SPACE_NAV } from '../../constants/navigation'
import { ROUTES } from '../../constants/routes'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { downloadMockDocument, isExternalUrl } from '../../utils/mockDownload'

export default function SpacePage() {
  const { slug } = useParams()
  const { data: page, loading, error } = useAsyncData(() => spaceService.getPage(slug), [slug])

  useDocumentTitle(page?.title || 'Space & Satellite')

  if (!slug) return <Navigate to={ROUTES.spaceSatellite} replace />
  if (loading) return <LoadingSpinner />
  if (error || !page) return <Navigate to="/404" replace />

  return (
    <>
      <PageBanner
        title={page.title}
        subtitle={page.subtitle}
        breadcrumbs={[
          { label: 'Space & Satellite', to: ROUTES.spaceSatellite },
          { label: page.title, to: `${ROUTES.spaceSatellite}/${slug}` },
        ]}
        image={page.image || PAGE_IMAGES.space}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {page.image && (
                <div className="mb-8 overflow-hidden rounded-xl">
                  <img src={page.image} alt="" className="aspect-[21/9] w-full object-cover" loading="lazy" />
                </div>
              )}
              {page.content?.map((paragraph, i) => (
                <p key={i} className="mb-4 text-slate-600 leading-relaxed">{paragraph}</p>
              ))}

              {page.documents && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-navy-900">Related Documents</h2>
                  <ul className="mt-3 space-y-2">
                    {page.documents.map((doc) => (
                      <li key={doc.title}>
                        {isExternalUrl(doc.url) ? (
                          <a href={doc.url} className="text-teal-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            {doc.title} {doc.size && `(${doc.size})`}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => downloadMockDocument({ title: doc.title, summary: page.subtitle, category: 'Space & Satellite' })}
                            className="text-teal-600 hover:underline"
                          >
                            {doc.title} {doc.size && `(${doc.size})`}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {page.crossLinks && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {page.crossLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="text-sm font-medium text-teal-600 hover:underline">
                      {link.label} →
                    </Link>
                  ))}
                </div>
              )}

              {page.contact && (
                <div className="mt-8 rounded-xl border border-slate-200 bg-white card-padding card-shadow">
                  <h2 className="text-lg font-semibold text-navy-900">Contact Information</h2>
                  <dl className="mt-4 space-y-2 text-sm text-slate-600">
                    <div><dt className="inline font-medium">Email: </dt><dd className="inline"><a href={`mailto:${page.contact.email}`} className="text-teal-600">{page.contact.email}</a></dd></div>
                    <div><dt className="inline font-medium">Phone: </dt><dd className="inline">{page.contact.phone}</dd></div>
                    <div><dt className="font-medium">Address</dt><dd>{page.contact.address}</dd></div>
                  </dl>
                </div>
              )}
            </div>

            <aside>
              <nav aria-label="Space section navigation" className="rounded-lg border border-slate-200 bg-white p-4 card-shadow">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Sections</h2>
                <ul className="space-y-1">
                  {SPACE_NAV.filter((item) => item.slug).map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={item.to}
                        className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                          item.slug === slug ? 'bg-teal-50 font-medium text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {page.highlights && (
                <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 card-shadow">
                  <h2 className="mb-3 text-sm font-semibold text-navy-900">Key Highlights</h2>
                  <ul className="space-y-2">
                    {page.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button to={ROUTES.contact} variant="outline" className="mt-6 w-full">
                Contact Us
              </Button>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
