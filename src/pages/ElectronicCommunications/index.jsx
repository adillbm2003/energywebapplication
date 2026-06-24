import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SectionHeading from '../../components/ui/SectionHeading'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import RelatedArticles from '../../components/ui/RelatedArticles'

const EC_NEWS = [
  {
    title: 'New supervision for power industry',
    url: 'https://www.royalgazette.com/other/news/article/20161028/new-supervision-for-power-industry/',
    date: '2016-10-28',
    source: 'Royal Gazette',
  },
  {
    title: 'Bill will establish an Electronic Communications Authority',
    url: 'https://www.royalgazette.com/politics/news/article/20111128/bill-will-establish-an-electronic-communications-authority/',
    date: '2011-11-28',
    source: 'Royal Gazette',
  },
]

const AREAS = [
  'Telecommunications licensing and regulation',
  'Spectrum management and coordination',
  'Broadband infrastructure policy',
  'Consumer protection in communications services',
  'International telecommunications treaties',
  '5G and next-generation network policy',
]

const REGULATORY_HIGHLIGHTS = [
  {
    heading: 'Power Industry Supervision',
    body: 'The Regulatory Authority of Bermuda (RAB) oversees the electricity sector, providing independent supervision of BELCO and ensuring fair, reliable service for consumers. Introduced in 2016, this framework brought Bermuda\'s power industry under formal regulatory scrutiny for the first time.',
  },
  {
    heading: 'Electronic Communications Authority',
    body: 'The Electronic Communications Act established a dedicated authority to license and regulate telecommunications providers, manage radio spectrum, and promote competitive, affordable communications services across Bermuda.',
  },
  {
    heading: 'Spectrum Management',
    body: 'Bermuda\'s spectrum is managed in accordance with international ITU frameworks, ensuring efficient use of radio frequencies for mobile, broadcast, satellite, and emerging 5G services.',
  },
]

export default function ElectronicCommunications() {
  useDocumentTitle('Electronic Communications')

  return (
    <>
      <PageBanner
        title="Electronic Communications"
        subtitle="Regulating and advancing Bermuda's telecommunications and digital infrastructure."
        breadcrumbs={[
          { label: 'Electronic Communications', to: '/electronic-communications' },
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
                Our work spans licensing, spectrum management, infrastructure policy, and consumer protection —
                supporting Bermuda&apos;s digital economy and connectivity goals.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                In 2016, new supervisory powers were introduced for the power industry, placing electricity services
                under formal independent oversight through the Regulatory Authority of Bermuda (RAB). This marked a
                significant step in aligning Bermuda&apos;s utility regulation with international best practices.
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

      {/* Regulatory Framework */}
      <section className="section-padding bg-slate-50">
        <div className="container-page">
          <SectionHeading
            title="Regulatory Framework"
            subtitle="How Bermuda supervises its communications and power industries"
            className="mb-8"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {REGULATORY_HIGHLIGHTS.map((item) => (
              <div key={item.heading} className="rounded-xl border border-slate-200 bg-white p-6 card-shadow">
                <div className="mb-3 h-1 w-10 rounded-full bg-teal-500" />
                <h3 className="mb-2 text-base font-semibold text-navy-900">{item.heading}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page">
          <RelatedArticles articles={EC_NEWS} heading="Legislative Background & News" />
        </div>
      </section>
    </>
  )
}
