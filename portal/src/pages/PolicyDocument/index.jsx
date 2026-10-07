import { useParams, Navigate } from 'react-router-dom'

import PageBanner from '../../components/common/PageBanner'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { PAGE_IMAGES } from '../../constants/branding'
import { ROUTES } from '../../constants/routes'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { policyDocuments } from '../../data/policyDocuments'
import DocumentBody from '../../components/common/DocumentBody'
import { sectionId } from '../../utils/sectionId'

// The document is set as web content, with its own section numbering, tables
// and definition lists. An earlier version embedded the PDF instead, which
// handed the page to the browser's own viewer: a dark toolbar, a thumbnail
// rail and a menu bar that belong to Chrome rather than to the Department,
// and that cannot be styled, linked to by section, or read sensibly on a
// phone. The original PDF stays downloadable for anyone who wants it.
//
// Contents sits beside the document body rather than beside the summary. The
// electricity policy has 65 entries in its contents, and pairing that with the
// short summary stretched the row to the height of the list and left most of a
// screen blank next to it. Beside the body it has something to sit against, and
// it sticks while the reader scrolls.
export default function PolicyDocument() {
  const { slug } = useParams()
  const doc = policyDocuments[slug]

  useDocumentTitle(doc?.title || 'Policy Document')

  if (!doc) return <Navigate to="/404" replace />

  return (
    <>
      <PageBanner
        title={doc.title}
        subtitle={`${doc.status} · ${doc.date}`}
        breadcrumbs={[
          { label: 'Policies & Legislation', to: ROUTES.policies },
          { label: doc.shortTitle, to: `${ROUTES.policies}/${slug}` },
        ]}
        image={PAGE_IMAGES.solarFieldBermuda}
      />

      <section className="section-padding pb-8">
        <div className="container-page">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge variant="gold">{doc.status}</Badge>
              <span className="text-caption text-slate-500">{doc.date}</span>
              <span className="text-caption text-slate-400">·</span>
              <span className="text-caption text-slate-500">{doc.issuedBy}</span>
            </div>

            {doc.summary.map((paragraph, i) => (
              <p key={i} className="mb-4 text-lg leading-relaxed text-slate-600">{paragraph}</p>
            ))}

            {doc.note && (
              <p className="mt-6 rounded-lg border-l-4 border-gold-500 bg-amber-50 px-4 py-3 text-body-small leading-relaxed text-slate-700">
                {doc.note}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={doc.file} variant="primary" target="_blank" rel="noopener noreferrer">
                Download PDF ({doc.fileSize})
              </Button>
              <Button to={ROUTES.policies} variant="outline">
                All policies &amp; legislation
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-50 pt-0">
        <div className="container-page">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <article className="order-2 rounded-xl border border-slate-200 bg-white px-6 py-8 card-shadow sm:px-10 sm:py-12 lg:order-1">
              <DocumentBody blocks={doc.blocks} />

              <footer className="mt-12 border-t border-slate-200 pt-6">
                <p className="text-caption text-slate-500">
                  {doc.title} — {doc.status}, {doc.date}. Issued by the {doc.issuedBy.replace('Government of Bermuda, ', '')}.
                </p>
                <div className="mt-4">
                  <Button href={doc.file} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">
                    Download the original PDF ({doc.fileSize})
                  </Button>
                </div>
              </footer>
            </article>

            {/* Capped at the viewport and scrollable in itself, so a long contents
                list never drives the height of the row. */}
            <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
              <nav
                aria-label={`Contents of ${doc.title}`}
                className="rounded-xl border border-slate-200 bg-white p-4 card-shadow lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
              >
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Contents</h2>
                <ol className="space-y-2.5">
                  {doc.contents.map((section) => (
                    <li key={section.number}>
                      <a
                        href={`#${sectionId(section.number)}`}
                        className="block text-sm font-semibold leading-snug text-navy-900 hover:text-teal-700"
                      >
                        {section.number}. {section.title}
                      </a>
                      {section.children && (
                        <ul className="mt-1 space-y-1 border-l border-slate-200 pl-3">
                          {section.children.map((child) => (
                            <li key={child}>
                              <span className="block text-caption leading-snug text-slate-600">{child}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
