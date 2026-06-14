import { Link } from 'react-router-dom'
import PageBanner from '../../components/common/PageBanner'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { PAGE_IMAGES } from '../../constants/branding'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'

const RESPONSIBILITIES = [
  'Reducing reliance on fossil fuel imports while balancing security, sustainability and affordability',
  'Supporting the development of renewable energy',
  'Providing education, advice and guidance on energy policy and regulation',
  'Supporting robust energy infrastructure development and maintenance',
  'Promoting energy efficiency, conservation and consumer awareness',
]

const TOPICS = [
  { title: 'Renewable Energy', description: 'Solar PV, battery storage, and community energy programmes.', to: ROUTES.renewableDashboard, image: PAGE_IMAGES.solar },
  { title: 'Energy Efficiency', description: 'Home and business efficiency guides and public sector retrofits.', to: ROUTES.education, image: PAGE_IMAGES.efficiency },
  { title: 'Electric Vehicles', description: 'EV adoption policy, charging infrastructure, and consumer guides.', to: ROUTES.transitionDashboard, image: PAGE_IMAGES.ev },
  { title: 'Fuels Policy', description: 'National fuels policy and the Fuels Act 2022.', to: ROUTES.policies, image: PAGE_IMAGES.government },
  { title: 'Registered Installers', description: 'List of certified solar PV installers in Bermuda.', to: ROUTES.installers, image: PAGE_IMAGES.solar },
  { title: 'Energy Simulator', description: 'Interactive Bermuda home model with live usage and BELCO bill estimates.', to: ROUTES.simulator, image: PAGE_IMAGES.home },
]

const CONSUMER_GUIDES = [
  'Solar photovoltaic guidance', 'Solar water heaters', 'Energy-efficient appliances',
  'Air conditioners', 'Lighting', 'Water heaters', 'Washing machines and dryers',
  'Vehicles', 'Micro-wind turbines', 'Space heaters',
]

export default function Energy() {
  useDocumentTitle('Energy')

  return (
    <>
      <PageBanner
        title="Energy"
        subtitle="Bermuda's comprehensive approach to a sustainable, secure, and affordable energy future."
        breadcrumbs={[{ label: 'Energy', to: ROUTES.energy }]}
        image={PAGE_IMAGES.energy}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading title="Department Role" className="mb-4" />
              <ul className="space-y-3">
                {RESPONSIBILITIES.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-navy-900 to-teal-900 text-white card-shadow">
              <img src={PAGE_IMAGES.bermuda} alt="" className="h-40 w-full object-cover opacity-80" loading="lazy" />
              <div className="card-padding">
              <h3>Energy Transition</h3>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                Bermuda is transitioning to cleaner energy through policy, investment, and public engagement.
                Explore our dashboards, registry, and GIS tools to track progress.
              </p>
              <Button to={ROUTES.renewableDashboard} variant="gold" className="mt-4">View Dashboards</Button>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((topic) => (
              <Link key={topic.title} to={topic.to} className="group overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-1 hover:border-teal-300 hover:card-shadow-hover">
                {topic.image && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={topic.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  </div>
                )}
                <div className="card-padding">
                  <h3 className="group-hover:text-teal-700">{topic.title}</h3>
                  <p className="mt-1.5 text-body-small text-slate-600">{topic.description}</p>
                  <span className="mt-2 inline-block text-body-small font-semibold text-teal-600">Learn more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeading title="Consumer Energy Guides" subtitle="Resources for homeowners and businesses" />
          <div className="flex flex-wrap gap-2">
            {CONSUMER_GUIDES.map((guide) => (
              <Link key={guide} to={ROUTES.education} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800">
                {guide}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
