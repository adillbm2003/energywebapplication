import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'

const FRAMEWORK = [
  {
    icon: '📋',
    title: 'Licensing',
    description: 'The Regulatory Authority of Bermuda (RA) issues and administers licences for telecommunications operators, service providers, and spectrum users in Bermuda.',
  },
  {
    icon: '📡',
    title: 'Spectrum Management',
    description: 'Allocating and coordinating radio frequency spectrum to ensure efficient, interference-free use across all sectors, in line with ITU frameworks.',
  },
  {
    icon: '🌐',
    title: 'Broadband Policy',
    description: 'Driving infrastructure investment and policy frameworks to expand reliable, affordable broadband access island-wide.',
  },
  {
    icon: '🛡️',
    title: 'Consumer Protection',
    description: 'Safeguarding residents and businesses through service standards, complaint resolution, and fair market practices overseen by the RA.',
  },
]

const INITIATIVES = [
  {
    tag: 'Infrastructure',
    title: '5G Network Policy',
    description: 'Developing the policy and legislative framework to support safe and efficient 5G deployment across Bermuda, including spectrum planning and infrastructure siting guidance.',
    image: PAGE_IMAGES.telecom,
  },
  {
    tag: 'Connectivity',
    title: 'Broadband Expansion',
    description: 'Advancing national broadband coverage to underserved areas and improving affordability through competition policy and infrastructure investment.',
    image: PAGE_IMAGES.grid,
  },
  {
    tag: 'Digital Economy',
    title: 'Digital Infrastructure Strategy',
    description: 'Supporting Bermuda\'s digital economy through policy coordination, international treaty obligations, and resilient communications infrastructure.',
    image: PAGE_IMAGES.innovation,
  },
]

export default function ElectronicCommunications() {
  useDocumentTitle('Electronic Communications')

  return (
    <>
      <PageBanner
        title="Electronic Communications"
        subtitle="Developing and maintaining Bermuda's policy, legislative, and strategic frameworks for the electronic communications sector."
        breadcrumbs={[
          { label: 'Sector', to: ROUTES.energy },
          { label: 'Electronic Communications', to: ROUTES.electronicCommunications },
        ]}
        image={PAGE_IMAGES.telecom}
      />

      {/* Overview */}
      <section className="section-padding">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading title="Overview" className="mb-4" />
              <p className="text-slate-600 leading-relaxed">
                The Department of Energy is responsible for developing and maintaining Bermuda&apos;s policy, legislative,
                and strategic frameworks for the electronic communications sector. Through policy development and legislative
                reform, the Department supports a resilient, innovative, and future-ready communications environment that
                advances Bermuda&apos;s digital economy and connectivity goals.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                The Department works closely with the{' '}
                <a
                  href="https://www.ra.bm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-700 hover:text-teal-800 underline"
                >
                  Regulatory Authority of Bermuda (RA)
                </a>
                , which is responsible for regulating the sector, including the licensing of telecommunications providers,
                spectrum management, and consumer protection functions.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                The Department also collaborates with government stakeholders, industry participants, and international
                organisations to ensure Bermuda&apos;s electronic communications framework aligns with international best
                practices and meets the evolving needs of residents and businesses.
              </p>
            </div>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl">
                <img src={PAGE_IMAGES.telecom} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
              </div>
              <div className="rounded-lg border border-teal-100 bg-teal-50 card-padding">
                <h3 className="text-base font-semibold text-navy-900">Regulatory Authority of Bermuda</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  The RA is Bermuda&apos;s independent regulator for the electronic communications sector, responsible
                  for licensing, spectrum management, and consumer protection.
                </p>
                <a
                  href="https://www.ra.bm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
                >
                  Visit www.ra.bm
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
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
            subtitle="The pillars of Bermuda's electronic communications oversight"
            align="center"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FRAMEWORK.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white card-padding card-shadow flex flex-col gap-3"
              >
                <span className="text-3xl" aria-hidden="true">{item.icon}</span>
                <h3 className="text-base font-semibold text-navy-900">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Initiatives */}
      <section className="section-padding">
        <div className="container-page">
          <SectionHeading
            title="Current Initiatives"
            subtitle="Active programmes shaping Bermuda's digital future"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {INITIATIVES.map((item) => (
              <article
                key={item.title}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow"
              >
                <div className="h-40 overflow-hidden">
                  <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="card-padding">
                  <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-700 mb-3">
                    {item.tag}
                  </span>
                  <h3 className="text-base font-semibold text-navy-900 leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Licensing Enquiries CTA */}
      <section className="section-padding bg-gradient-to-br from-navy-900 to-teal-900 text-white">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <span className="inline-block rounded-full bg-gold-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-navy-900 mb-4">
                Licensing &amp; Regulation
              </span>
              <h2 className="text-white text-2xl font-bold leading-snug">
                Applying for a Communications Licence?
              </h2>
              <p className="mt-3 text-slate-300 leading-relaxed">
                Licensing for telecommunications operators and spectrum users is administered by the Regulatory Authority
                of Bermuda (RA). Contact the RA directly for licence categories, application requirements, and fees.
                The Department of Energy remains available for policy and legislative enquiries.
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:items-start">
              <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm card-padding w-full">
                <h3 className="text-white font-semibold">Contact &amp; Resources</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://www.ra.bm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors"
                  >
                    Visit RA Website
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                  <Button to={ROUTES.contact} variant="outline" className="border-white/40 text-white hover:bg-white/10">
                    Contact Department
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
