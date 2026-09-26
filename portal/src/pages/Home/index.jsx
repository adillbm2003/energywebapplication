import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../../components/common/Hero'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import NewsCard from '../../components/cards/NewsCard'
import ProjectCard from '../../components/cards/ProjectCard'
import KPIWidget from '../../components/dashboard/KPIWidget'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import {
  dashboardService,
  newsService,
  consultationService,
  projectService,
} from '../../services'
import { ROUTES } from '../../constants/routes'
import { EXTERNAL_LINKS } from '../../constants/externalLinks'
import { homePriorities, homeExplore } from '../../data/home'
import { formatDate } from '../../utils/format'
import Badge from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'
import EnergyAwarenessGuides from '../../components/home/EnergyAwarenessGuides'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function Home() {
  useDocumentTitle('Home')

  const { data: stats, loading: statsLoading } = useAsyncData(() => dashboardService.getHomeStats(), [])
  const { data: news, loading: newsLoading } = useAsyncData(() => newsService.getAll(), [])
  const { data: consultations } = useAsyncData(() => consultationService.getActive(), [])
  const { data: projects } = useAsyncData(() => projectService.getFeatured(), [])

  const latestNews = news?.slice(0, 4) ?? []
  const activeConsultations = consultations ?? []


  return (
    <>
      <Hero
        title="Powering Bermuda's Sustainable Energy Future"
        subtitle="The Department of Energy is Bermuda's authoritative source for energy policy, renewable energy data, consultations, education, and innovation."
        ctaLabel="Explore Renewable Dashboard"
        ctaTo={ROUTES.renewableDashboard}
        secondaryLabel="View Consultations"
        secondaryTo={ROUTES.consultations}
        useDefaultImage
      />

      <section className="section-padding bg-white" aria-labelledby="priorities-heading">
        <div className="container-page">
          <SectionHeading
            id="priorities-heading"
            title="Driving Bermuda's Energy Transition"
            subtitle="Explore programmes, data, and policy tools supporting a cleaner, more resilient island"
            align="center"
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {homePriorities.map((item, index) => (
              <motion.article
                key={item.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-1 hover:card-shadow-hover"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="card-padding">
                  <h3>{item.title}</h3>
                  <p className="mt-2 text-body-small text-slate-600">{item.description}</p>
                  <Button to={item.to} href={item.href} target={item.href ? '_blank' : undefined} rel={item.href ? 'noopener noreferrer' : undefined} variant="outline" size="sm" className="mt-3">
                    {item.cta}
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-100/80" aria-labelledby="stats-heading">
        <div className="container-page">
          <SectionHeading title="Key Statistics" subtitle="Bermuda's energy transition at a glance" align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : stats?.map((stat) => (
                  // No year-on-year figure: the values below are refreshed from the
                  // CMS and the solar registry, but the percentages never were, so
                  // "+9% YoY" sat under a capacity it had not been calculated from.
                  <KPIWidget
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    unit={stat.unit}
                  />
                ))}
          </div>
        </div>
      </section>

      <EnergyAwarenessGuides loading={statsLoading} />

      <section className="section-padding bg-slate-100/80" aria-labelledby="explore-heading">
        <div className="container-page">
          <SectionHeading title="Explore" subtitle="Programmes and resources across the Department" align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeExplore.map((spot) => (
              <Link
                key={spot.title}
                to={spot.to}
                className="group relative overflow-hidden rounded-xl aspect-[4/5] card-shadow transition-all hover:-translate-y-1 hover:card-shadow-hover"
              >
                <img
                  src={spot.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-900/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="rounded-full bg-gold-500/90 px-2 py-0.5 text-caption font-semibold uppercase tracking-wide text-navy-900">
                    {spot.tag}
                  </span>
                  <h3 className="mt-1.5 text-white">{spot.title}</h3>
                  <p className="mt-1 text-caption text-slate-200 line-clamp-2">{spot.description}</p>
                  <span className="mt-2 inline-block text-caption font-semibold text-teal-300 group-hover:text-teal-200">
                    Learn more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding" aria-labelledby="initiatives-heading">
        <div className="container-page">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading title="Featured Initiatives" subtitle="Major energy projects driving Bermuda forward" className="mb-0" />
            <Button to={ROUTES.projects} variant="outline">View All Projects</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        </div>
      </section>


      {/* A pointer to the register, not a copy of it. Three installers used to be
          listed here as full cards, which put the same companies on two pages and
          implied the Department was featuring three of them. The register itself
          is the authoritative list and lives on its own page. */}
      <section className="section-padding bg-white" aria-labelledby="installers-heading">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading title="Registered Solar PV Installers" subtitle="Registered professionals for your renewable energy project" className="mb-0" />
            <Button to={ROUTES.installers} variant="outline">View All Installers</Button>
          </div>
        </div>
      </section>

      <section className="section-padding" aria-labelledby="news-heading">
        <div className="container-page">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading title="Latest News" subtitle="Updates from the Department of Energy" className="mb-0" />
            <Button to={ROUTES.news} variant="outline">News Centre</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {newsLoading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : latestNews.map((article) => <NewsCard key={article.id} article={article} />)}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white" aria-labelledby="consultations-heading">
        <div className="container-page">
          <SectionHeading title="Active Consultations" subtitle="Have your say on Bermuda's energy future" />
          <div className="mb-4 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white card-padding text-body-small text-teal-800">
            Public submissions are made through the{' '}
            <a href={EXTERNAL_LINKS.consultationsForum} className="font-semibold underline hover:text-teal-900" target="_blank" rel="noopener noreferrer">
              Government Consultations Forum
            </a>.
          </div>

          {activeConsultations.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">No open consultations at this time.</p>
              <Button to={ROUTES.consultations} variant="outline" size="sm" className="mt-3">View All Consultations</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeConsultations.map((con) => (
                <motion.article key={con.id} {...fadeUp} className="flex items-center justify-between gap-4 rounded-xl border border-teal-200 bg-teal-50/50 px-5 py-4 card-shadow">
                  <div>
                    <Badge status="active">Open</Badge>
                    <h3 className="mt-2 text-base font-semibold text-navy-900">{con.title}</h3>
                    {con.closingDate && <p className="mt-1 text-xs text-slate-500">Closes {formatDate(con.closingDate)}</p>}
                  </div>
                  <Button
                    href={con.externalUrl || EXTERNAL_LINKS.consultationsForum}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    size="sm"
                    className="shrink-0"
                  >
                    Submit Response →
                  </Button>
                </motion.article>
              ))}
              <div className="mt-2 text-right">
                <Button to={ROUTES.consultations} variant="outline" size="sm">View All Consultations</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-white" aria-labelledby="roadmap-heading">
        <div className="container-page">
          <SectionHeading
            id="roadmap-heading"
            title="Bermuda's Energy Transition Roadmap"
            subtitle="A journey towards a cleaner, more sustainable Bermuda"
            align="center"
          />
          <div className="relative mt-10">
            <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-teal-600 to-navy-900 md:block" aria-hidden="true" />
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-9">
              {[
                { year: '2010', title: 'Solar Energy Rebate', desc: 'Incentives introduced to encourage solar energy adoption.', icon: '☀️', tag: 'Lower Emissions' },
                { year: '2015', title: 'National Electricity Policy', desc: 'Long-term vision for a reliable, affordable and sustainable energy sector.', icon: '📋', tag: 'Greater Savings' },
                { year: '2016', title: 'Electricity Act 2016', desc: 'Updated legislation to modernise the sector and support independent power.', icon: '⚖️', tag: 'Energy Resilience' },
                { year: '2017', title: '6 MW Airport Solar', desc: 'Milestone solar PV project at L.F. Wade International Airport.', icon: '🏗️', tag: 'Resilience' },
                { year: '2018', title: 'National Fuels Policy', desc: 'Framework to guide sustainable fuels management and reduce emissions.', icon: '⛽', tag: 'Lower Carbon' },
                { year: '2022', title: 'Fuels Act 2022', desc: 'Modernised legislation for the safe, sustainable management of fuels.', icon: '📜', tag: 'Healthier Communities' },
                { year: '2023', title: '70 Electric Buses', desc: 'A significant step towards cleaner public transport and reduced emissions.', icon: '🚌', tag: 'Sustainable Future' },
                { year: '2025', title: '14.3 MW Distributed Gen.', desc: 'Growing local clean energy generation for a resilient, sustainable Bermuda.', icon: '⚡', tag: 'Clean Energy' },
                { year: '2026', title: '20 New Electric Buses', desc: 'A further 20 electric buses added to the public transport fleet.', icon: '🚍', tag: 'Cleaner Transport' },
              ].map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-teal-500 to-navy-800 text-2xl card-shadow">
                    {milestone.icon}
                  </div>
                  <span className="mt-2 text-lg font-bold text-teal-700">{milestone.year}</span>
                  <h4 className="mt-1 text-xs font-semibold text-navy-900 leading-snug">{milestone.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{milestone.desc}</p>
                  <span className="mt-2 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                    {milestone.tag}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mt-8 text-center">
            <Button to={ROUTES.transitionDashboard} variant="primary">View Full Transition Dashboard</Button>
          </div>
        </div>
      </section>
    </>
  )
}
