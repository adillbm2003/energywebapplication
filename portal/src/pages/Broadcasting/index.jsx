import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'

const PILLARS = [
  {
    icon: '📺',
    title: 'Policy & Legislative Framework',
    description: 'The Government of Bermuda, through the Department of Energy, is responsible for developing and maintaining the policy and legislative framework governing Bermuda\'s broadcasting sector.',
  },
  {
    icon: '🎙️',
    title: 'Broadcasting Commissioners',
    description: 'Broadcasting regulation is administered through the Broadcasting Commissioners, who oversee the licensing and regulation of broadcasting services in accordance with Bermuda\'s broadcasting legislation.',
  },
  {
    icon: '🤝',
    title: 'Stakeholder Collaboration',
    description: 'The Department works closely with the Broadcasting Commissioners, industry stakeholders, and government partners to support a diverse, sustainable, and future-ready broadcasting environment.',
  },
  {
    icon: '🚀',
    title: 'Modernisation & Reform',
    description: 'The Government is pursuing broadcasting reform initiatives to establish a contemporary regulatory framework that promotes innovation, competition, local content, and greater alignment with Bermuda\'s broader digital objectives.',
  },
]

export default function Broadcasting() {
  useDocumentTitle('Broadcasting Sector')

  return (
    <>
      <PageBanner
        title="Broadcasting Sector"
        subtitle="Developing and maintaining the policy and legislative framework governing Bermuda's broadcasting sector."
        breadcrumbs={[
          { label: 'Sector', to: ROUTES.energy },
          { label: 'Broadcasting', to: ROUTES.broadcasting },
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
                The Government of Bermuda is responsible for developing and maintaining the policy and legislative
                framework governing Bermuda&apos;s broadcasting sector. Through the Department of Energy, the Government
                is advancing the modernization of broadcasting legislation and policy to ensure the sector remains
                responsive to technological change, evolving consumer preferences, and international best practices.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Broadcasting regulation is currently administered through the Broadcasting Commissioners, who are
                responsible for overseeing the licensing and regulation of broadcasting services in accordance with
                Bermuda&apos;s broadcasting legislation.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                The Department works closely with the Broadcasting Commissioners, industry stakeholders, and government
                partners to support a diverse, sustainable, and future-ready broadcasting environment that serves the
                interests of residents, businesses, and the wider community.
              </p>
            </div>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl">
                <img src={PAGE_IMAGES.telecom} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
              </div>
              <div className="rounded-lg border border-teal-100 bg-teal-50 card-padding">
                <h3 className="text-base font-semibold text-navy-900">Broadcasting Reform</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  As part of its ongoing modernisation efforts, the Government is pursuing broadcasting reform initiatives
                  to establish a contemporary regulatory framework that promotes innovation, competition, local content,
                  and greater alignment with Bermuda&apos;s broader digital and communications objectives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four pillars */}
      <section className="section-padding bg-slate-50">
        <div className="container-page">
          <SectionHeading
            title="Key Areas"
            subtitle="The foundations of Bermuda's broadcasting governance"
            align="center"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((item) => (
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

      {/* CTA */}
      <section className="section-padding bg-gradient-to-br from-navy-900 to-teal-900 text-white">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <span className="inline-block rounded-full bg-gold-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-navy-900 mb-4">
                Broadcasting
              </span>
              <h2 className="text-white text-2xl font-bold leading-snug">
                Broadcasting Enquiries
              </h2>
              <p className="mt-3 text-slate-300 leading-relaxed">
                For enquiries related to broadcasting licensing, regulation, or policy matters, contact
                the Department of Energy. The Department coordinates with the Broadcasting Commissioners
                on all regulatory matters.
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:items-start">
              <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm card-padding w-full">
                <h3 className="text-white font-semibold">Contact the Department</h3>
                <p className="mt-2 text-sm text-slate-300">
                  For broadcasting policy and legislative enquiries, reach out to the Department of Energy.
                </p>
                <div className="mt-4">
                  <Button to={ROUTES.contact} variant="gold">
                    Contact Us
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
