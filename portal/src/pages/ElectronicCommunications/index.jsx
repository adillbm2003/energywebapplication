import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'

const AREAS = [
  'Telecommunications licensing and regulation',
  'Spectrum management and coordination',
  'Broadband infrastructure policy',
  'Consumer protection in communications services',
  'International telecommunications treaties',
  '5G and next-generation network policy',
]

export default function ElectronicCommunications() {
  useDocumentTitle('Electronic Communications')

  return (
    <>
      <PageBanner
        title="Electronic Communications"
        subtitle="Regulating and advancing Bermuda's telecommunications and digital infrastructure."
        breadcrumbs={[
          { label: 'Energy', to: ROUTES.energy },
          { label: 'Electronic Communications', to: ROUTES.electronicCommunications },
        ]}
        image={PAGE_IMAGES.telecom}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading title="Overview" className="mb-4" />
              <p className="text-slate-600 leading-relaxed">
                The Department of Energy oversees Bermuda&apos;s electronic communications regulatory framework,
                ensuring reliable, affordable, and secure telecommunications services for residents and businesses.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Our work spans licensing, spectrum management, infrastructure policy, and consumer protection ?
                supporting Bermuda&apos;s digital economy and connectivity goals.
              </p>
            </div>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl">
                <img src={PAGE_IMAGES.telecom} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
              </div>
              <div className="rounded-lg border border-slate-200 bg-white card-padding card-shadow">
              <h3 className="text-lg font-semibold text-navy-900">Key Responsibilities</h3>
              <ul className="mt-4 space-y-2">
                {AREAS.map((area) => (
                  <li key={area} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
                    {area}
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page text-center">
          <SectionHeading
            title="Related: Space & Satellite"
            subtitle="Bermuda's communications expertise extends to satellite filing and earth station operations."
            align="center"
          />
          <Button to={ROUTES.spaceSatellite} variant="primary">Explore Space & Satellite</Button>
        </div>
      </section>
    </>
  )
}
