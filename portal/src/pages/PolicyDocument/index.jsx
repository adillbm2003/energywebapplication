import { useParams, Navigate } from 'react-router-dom'

import PageBanner from '../../components/common/PageBanner'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SectionHeading from '../../components/ui/SectionHeading'
import { PAGE_IMAGES } from '../../constants/branding'
import { ROUTES } from '../../constants/routes'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { policyDocuments } from '../../data/policyDocuments'

// The document is shown as the Department published it: the PDF is embedded, so
// the layout, numbering and tables are the document's own rather than a
// transcription of them. The contents list above it is there so the page is
// navigable and readable where a PDF cannot be rendered -- phones commonly
// refuse to, and a screen reader gets nothing from an <object> -- and the file
// is downloadable either way.
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

      <section className="section-padding">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Badge variant="gold">{doc.status}</Badge>
                <span className="text-caption text-slate-500">{doc.date}</span>
                <span className="text-caption text-slate-400">·</span>
                <span className="text-caption text-slate-500">{doc.issuedBy}</span>
              </div>

              {doc.summary.map((paragraph, i) => (
                <p key={i} className="mb-4 text-slate-600 leading-relaxed text-lg">{paragraph}</p>
              ))}

              {doc.note && (
                <p className="mt-6 rounded-lg border-l-4 border-gold-500 bg-amber-50 px-4 py-3 text-body-small leading-relaxed text-slate-700">
                  {doc.note}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={doc.file} variant="primary" target="_blank" rel="noopener noreferrer">
                  Download PDF ({doc.fileSize})
                </Button>
                <Button to={ROUTES.policies} variant="outline">
                  All policies &amp; legislation
                </Button>
              </div>
            </div>

            <aside>
              <nav
                aria-label={`Contents of ${doc.title}`}
                className="rounded-lg border border-slate-200 bg-white p-4 card-shadow"
              >
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Contents</h2>
                <ol className="space-y-3">
                  {doc.contents.map((section) => (
                    <li key={section.number}>
                      <p className="text-sm font-semibold text-navy-900">
                        {section.number}. {section.title}
                      </p>
                      {section.children && (
                        <ul className="mt-1 space-y-1 border-l border-slate-200 pl-3">
                          {section.children.map((child) => (
                            <li key={child} className="text-caption leading-relaxed text-slate-600">{child}</li>
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

      <section className="section-padding bg-slate-50 pt-0">
        <div className="container-page">
          <SectionHeading
            title="Read the document"
            subtitle="The full document, as published"
            className="mb-4"
          />
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
            <object data={doc.file} type="application/pdf" className="h-[80vh] min-h-[480px] w-full" aria-label={doc.title}>
              <div className="card-padding">
                <p className="text-slate-600 leading-relaxed">
                  Your browser cannot display the document inline.
                </p>
                <div className="mt-4">
                  <Button href={doc.file} variant="primary" target="_blank" rel="noopener noreferrer">
                    Download PDF ({doc.fileSize})
                  </Button>
                </div>
              </div>
            </object>
          </div>
          <p className="mt-3 text-caption text-slate-500">
            Issued by the {doc.issuedBy.replace('Government of Bermuda, ', '')}, {doc.date}. If the document does not
            display above, <a href={doc.file} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 underline hover:text-teal-800">open the PDF directly</a>.
          </p>
        </div>
      </section>
    </>
  )
}
