import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'

// The page held an Emerging Technologies grid of nine cards read from
// /api/innovation, a standalone Digital Currency & Energy block that repeated
// one of them, and a row of cross-links. All of it is withdrawn at the
// Department's request pending review; the page stays reachable and says so.
//
// Nothing is deleted to achieve this. The topics are still in the CMS, the
// service that reads them is untouched, and data/innovation.js still carries
// the fallback and the card images. Restoring the section is a matter of
// putting the grid back, not of re-entering the content.
export default function Innovation() {
  useDocumentTitle('Energy Innovation')

  return (
    <>
      <PageBanner
        title="Energy Innovation & Emerging Technologies"
        subtitle="Exploring technologies that support Bermuda's energy transition."
        breadcrumbs={[{ label: 'Innovation', to: ROUTES.innovation }]}
        image={PAGE_IMAGES.innovation}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="mx-auto max-w-2xl rounded-xl border-2 border-dashed border-gold-300 bg-gold-50/50 px-6 py-16 text-center">
            <span className="inline-block rounded-lg bg-gold-500 px-3 py-1 text-caption font-semibold uppercase tracking-wide text-navy-900">
              Coming Soon
            </span>
            <h2 className="mt-4">Energy Innovation &amp; Emerging Technologies</h2>
            <p className="mx-auto mt-3 max-w-xl text-body-small text-slate-600 leading-relaxed">
              This section is being prepared and will be published once the content has been
              reviewed by the Department.
            </p>
            <Button to={ROUTES.contact} variant="outline" className="mt-6">
              Contact the Department
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
