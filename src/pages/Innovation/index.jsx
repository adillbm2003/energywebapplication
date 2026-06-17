import { Link } from 'react-router-dom'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { innovationService } from '../../services/innovationService'
import { ROUTES } from '../../constants/routes'

const RELATED_LINKS = [
  { label: 'Space & Satellite', to: ROUTES.spaceSatellite },
  { label: 'GIS Heat Map', to: ROUTES.gis },
  { label: 'Education Centre', to: ROUTES.education },
]

export default function Innovation() {
  useDocumentTitle('Energy Innovation')

  const { data: topics = [] } = useAsyncData(() => innovationService.getTopics(), [])
  const { data: digitalCurrency } = useAsyncData(() => innovationService.getDigitalCurrency(), [])

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
          <p className="max-w-3xl text-body-small text-slate-600">
            The Department of Energy fosters innovation in clean energy technologies. This section provides educational
            content on emerging technologies - for policy awareness and research purposes, not financial advice.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topics.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-1 hover:card-shadow-hover">
                {item.image && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="card-padding">
                  <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-caption font-semibold text-teal-700">{item.status}</span>
                  <h3 className="mt-2">{item.title}</h3>
                  <p className="mt-1.5 text-body-small text-slate-600">{item.description}</p>
                  {item.linkTo && (
                    <Button to={item.linkTo} variant="outline" size="sm" className="mt-3">
                      {item.linkLabel || 'Learn more'}
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {digitalCurrency && (
            <div className="mt-8 overflow-hidden rounded-xl border-2 border-dashed border-gold-300 bg-gold-50/50">
              {digitalCurrency.image && (
                <img src={digitalCurrency.image} alt="" className="h-48 w-full object-cover opacity-90" loading="lazy" />
              )}
              <div className="card-padding">
                <span className="rounded-lg bg-gold-500 px-3 py-1 text-caption font-semibold uppercase text-navy-900">{digitalCurrency.status}</span>
                <h3 className="mt-3">{digitalCurrency.title}</h3>
                <p className="mt-2 text-body-small text-slate-600">{digitalCurrency.description}</p>
                <p className="mt-2 text-body-small italic text-slate-500">{digitalCurrency.note}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            {RELATED_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm font-medium text-teal-600 hover:underline">
                {link.label} &rarr;
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-navy-900 text-white">
        <div className="container-page text-center">
          <SectionHeading title="Partner With Us" subtitle="Interested in energy innovation in Bermuda?" align="center" className="[&_h2]:text-white [&_p]:text-slate-300" />
          <Button to={ROUTES.contact} variant="gold">Contact the Department</Button>
        </div>
      </section>
    </>
  )
}
