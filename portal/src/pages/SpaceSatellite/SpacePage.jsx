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
        image={page.image || PAGE_IMAGES.spaceSatellites}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              {page.image && (
                <div className="mb-8 overflow-hidden rounded-xl">
                  <img src={page.image} alt="" className="aspect-[21/9] w-full object-cover" loading="lazy" />
                </div>
              )}

              {/* Intro paragraphs */}
              {page.content?.map((paragraph, i) => (
                <p key={i} className="mb-4 text-slate-600 leading-relaxed text-lg">{paragraph}</p>
              ))}

              {/* Rich sections */}
              {page.sections?.map((section, si) => (
                <div key={si} className="mt-10">
                  <h2 className="text-xl font-bold text-navy-900 mb-4">{section.heading}</h2>
                  {section.paragraphs?.map((p, pi) => (
                    <p key={pi} className="mb-4 text-slate-600 leading-relaxed">{p}</p>
                  ))}
                  {section.bullets && (
                    <ul className="mt-3 space-y-2 mb-4">
                      {section.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2 text-slate-600">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Documents */}
              {page.documents && (
                <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-lg font-semibold text-navy-900 mb-3">Related Documents</h2>
                  <ul className="space-y-3">
                    {page.documents.map((doc) => (
                      <li key={doc.title} className="flex items-center gap-3">
                        <span className="text-teal-600 text-lg">📄</span>
                        {isExternalUrl(doc.url) ? (
                          <a href={doc.url} className="text-teal-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                            {doc.title} {doc.size && <span className="text-slate-400 font-normal text-sm">({doc.size})</span>}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => downloadMockDocument({ title: doc.title, summary: page.subtitle, category: 'Space & Satellite' })}
                            className="text-teal-600 hover:underline font-medium text-left"
                          >
                            {doc.title} {doc.size && <span className="text-slate-400 font-normal text-sm">({doc.size})</span>}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cross-links */}
              {page.crossLinks && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {page.crossLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors">
                      {link.label} →
                    </Link>
                  ))}
                </div>
              )}

              {/* Contact */}
              {page.contact && (
                <div className="mt-10 rounded-xl border border-slate-200 bg-white card-padding card-shadow">
                  <h2 className="text-lg font-semibold text-navy-900 mb-4">Contact Information</h2>
                  <dl className="space-y-3 text-sm text-slate-600">
                    <div className="flex gap-2">
                      <dt className="font-medium text-slate-700 min-w-[60px]">Email:</dt>
                      <dd><a href={`mailto:${page.contact.email}`} className="text-teal-600 hover:underline">{page.contact.email}</a></dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium text-slate-700 min-w-[60px]">Phone:</dt>
                      <dd>{page.contact.phone}</dd>
                    </div>
                    {page.contact.hours && (
                      <div className="flex gap-2">
                        <dt className="font-medium text-slate-700 min-w-[60px]">Hours:</dt>
                        <dd>{page.contact.hours}</dd>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <dt className="font-medium text-slate-700 min-w-[60px]">Address:</dt>
                      <dd>{page.contact.address}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>

            {/* Sidebar */}
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
                  <h2 className="mb-3 text-sm font-semibold text-navy-900">Key Points</h2>
                  <ul className="space-y-2">
                    {page.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 rounded-lg border border-teal-100 bg-teal-50 p-4">
                <p className="text-sm font-semibold text-teal-800 mb-1">Space Sector Enquiries</p>
                <p className="text-xs text-teal-700 mb-3">Contact the Department of Energy for space and satellite matters.</p>
                <Button to={`${ROUTES.spaceSatellite}/sector-enquiries`} variant="outline" className="w-full text-sm">
                  Get in Touch
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
