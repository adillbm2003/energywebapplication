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
  {
    title: 'Renewable Energy',
    description: 'Solar PV, battery storage, net metering, and community energy programmes across Bermuda.',
    to: ROUTES.renewableDashboard,
    image: PAGE_IMAGES.solar,
  },
  {
    title: 'Energy Efficiency',
    description: 'Home and business efficiency guides, public sector retrofits, and Energy Star appliances.',
    to: ROUTES.education,
    image: PAGE_IMAGES.efficiency,
  },
  {
    title: 'Electric Vehicles',
    description: 'EV adoption policy, public charging infrastructure, and vehicle fleet fuel-type data.',
    to: ROUTES.vehicles,
    image: PAGE_IMAGES.ev,
  },
  {
    title: 'Energy Transition Dashboard',
    description: 'Live EV adoption trends, public transport electrification, and fleet statistics.',
    to: ROUTES.transitionDashboard,
    image: PAGE_IMAGES.transport,
  },
  {
    title: 'Fuels Policy',
    description: 'National fuels policy framework and the Fuels Act 2022 guiding sustainable fuels management.',
    to: ROUTES.policies,
    image: PAGE_IMAGES.fuelsPolicy,
  },
  {
    title: 'GIS Solar PV Map',
    description: 'Interactive map of solar installations, renewable sites, and energy infrastructure island-wide.',
    to: ROUTES.gis,
    image: PAGE_IMAGES.energyGisMap,
  },
  {
    title: 'Registered Solar Installers',
    description: 'Directory of certified solar PV and battery storage installers operating in Bermuda.',
    to: ROUTES.installers,
    image: PAGE_IMAGES.solarCommercial,
  },
  {
    title: 'Energy Simulator',
    description: 'Interactive Bermuda home model with live usage estimates and BELCO bill projections.',
    href: 'https://simulator.energy.bm/',
    image: PAGE_IMAGES.simulator,
  },
]

// Every card here says "View guide", so every card has to open one. They used
// to point at pages instead -- Solar Photovoltaic at the installer directory,
// Electric Vehicles at the Vehicles page, Micro-Wind Turbines at the policy
// repository, and the other five at the Education Centre landing page, which
// left the reader to find the guide themselves. Each now opens its own
// infographic, the same file the Education Centre serves.
const GUIDES_BASE = import.meta.env.BASE_URL || '/'

const CONSUMER_GUIDES = [
  {
    icon: '☀️',
    title: 'Solar Photovoltaic',
    description: 'Net metering rules, certified installers, and ROI calculations for rooftop solar PV systems.',
    href: GUIDES_BASE + 'guides/solar-pv-guide.png',
  },
  {
    icon: '🌡️',
    title: 'Solar Water Heaters',
    description: 'Guidance on selecting, sizing, and installing solar thermal water heating for homes.',
    href: GUIDES_BASE + 'guides/solar-water-heater-guide.png',
  },
  {
    icon: '❄️',
    title: 'Air Conditioners',
    description: 'SEER ratings, optimal thermostat settings, and efficient cooling for Bermuda\'s climate.',
    href: GUIDES_BASE + 'guides/ac-energy-guide.png',
  },
  {
    // The one card that is a set rather than a single guide: fridges, washing
    // machines, televisions, computers and space heaters each have their own.
    icon: '💡',
    title: 'Energy-Efficient Appliances',
    description: 'Energy Star-rated washing machines, dryers, refrigerators, and water heaters.',
    to: ROUTES.education + '?category=Appliance+Guides',
    cta: 'Browse appliance guides →',
  },
  {
    icon: '🚗',
    title: 'Electric Vehicles',
    description: 'EV charging standards, residential socket upgrades, and public charging network locations.',
    href: GUIDES_BASE + 'guides/vehicle-energy-guide.png',
  },
  {
    icon: '💧',
    title: 'Water Heaters',
    description: 'Heat pump and solar water heater options to reduce hot water energy costs.',
    href: GUIDES_BASE + 'guides/water-heater-energy-guide.png',
  },
  {
    icon: '💨',
    title: 'Micro-Wind Turbines',
    description: 'Permitting requirements, siting guidance, and grid interconnection for small wind systems.',
    href: GUIDES_BASE + 'guides/micro-wind-energy-guide.png',
  },
  {
    icon: '🔆',
    title: 'LED Lighting',
    description: 'Retrofit guidance, lumen output comparison, and rebate eligibility for LED upgrades.',
    href: GUIDES_BASE + 'guides/lighting-energy-guide.png',
  },
]

export default function Energy() {
  useDocumentTitle('Sector')

  return (
    <>
      <PageBanner
        title="Sector"
        subtitle="Bermuda's comprehensive approach to a sustainable, secure, and affordable energy future."
        breadcrumbs={[{ label: 'Sector', to: ROUTES.energy }]}
        image={PAGE_IMAGES.energy}
      />

      {/* Department Role + Transition callout */}
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
              <img src={PAGE_IMAGES.transport} alt="" className="h-40 w-full object-cover opacity-80" loading="lazy" />
              <div className="card-padding">
                <h3 className="text-white">Energy Transition</h3>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                  Bermuda is transitioning to cleaner energy through policy, investment, and public engagement.
                  Explore our dashboards, registry, and GIS tools to track live progress.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button to={ROUTES.renewableDashboard} variant="gold">Renewable Dashboard</Button>
                  <Button to={ROUTES.transitionDashboard} variant="outline" className="border-white/60 text-white hover:bg-white/10">
                    Transition Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Topic cards */}
          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TOPICS.map((topic) => {
              const cardClass = "group overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-1 hover:border-teal-300 hover:card-shadow-hover"
              const inner = (
                <>
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={topic.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="card-padding">
                    <h3 className="text-base group-hover:text-teal-700">{topic.title}</h3>
                    <p className="mt-1.5 text-body-small text-slate-600 line-clamp-2">{topic.description}</p>
                    <span className="mt-2 inline-block text-body-small font-semibold text-teal-600 group-hover:underline">
                      Learn more →
                    </span>
                  </div>
                </>
              )
              return topic.href ? (
                <a key={topic.title} href={topic.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                  {inner}
                </a>
              ) : (
                <Link key={topic.title} to={topic.to} className={cardClass}>
                  {inner}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Consumer Energy Guides — prominent card grid */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeading
            title="Consumer Energy Guides"
            subtitle="Official guidance for homeowners and businesses on energy efficiency, renewable systems, and savings"
            align="center"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONSUMER_GUIDES.map((guide) => {
              // A guide is a file, so it opens in a new tab through a plain anchor, the
              // same way the Education Centre serves the very same file. The one card
              // that points at a filtered list stays a router link.
              const Wrapper = guide.href ? 'a' : Link
              const linkProps = guide.href
                ? { href: guide.href, target: '_blank', rel: 'noopener noreferrer' }
                : { to: guide.to }
              return (
              <Wrapper
                key={guide.title}
                {...linkProps}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-1 hover:border-teal-300 hover:card-shadow-hover"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="text-2xl" aria-hidden="true">{guide.icon}</span>
                  <h3 className="text-sm font-semibold text-navy-900 group-hover:text-teal-700 leading-snug">
                    {guide.title}
                  </h3>
                </div>
                <div className="flex flex-1 flex-col card-padding">
                  <p className="flex-1 text-body-small text-slate-600 leading-relaxed">{guide.description}</p>
                  <span className="mt-3 text-body-small font-semibold text-teal-600 group-hover:underline">
                    {guide.cta || 'View guide →'}
                  </span>
                </div>
              </Wrapper>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
