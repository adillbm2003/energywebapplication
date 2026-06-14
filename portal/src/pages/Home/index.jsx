import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../../components/common/Hero'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import NewsCard from '../../components/cards/NewsCard'
import ProjectCard from '../../components/cards/ProjectCard'
import InstallerCard from '../../components/cards/InstallerCard'
import KPIWidget from '../../components/dashboard/KPIWidget'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import {
  dashboardService,
  newsService,
  consultationService,
  projectService,
} from '../../services'
import { installerService } from '../../services/installerService'
import { ROUTES } from '../../constants/routes'
import { EXTERNAL_LINKS } from '../../constants/externalLinks'
import { homePriorities, homeSpotlights, homeQuickAccess } from '../../data/home'
import { PAGE_IMAGES } from '../../constants/branding'
import { formatDate } from '../../utils/format'
import { downloadMockDocument } from '../../utils/mockDownload'
import SafeImage from '../../components/common/SafeImage'
import Badge from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'
import EnergyAwarenessGuides from '../../components/home/EnergyAwarenessGuides'
import { resolveContentImage } from '../../utils/contentImages'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function Home() {
  useDocumentTitle('Home')

  const { data: stats, loading: statsLoading } = useAsyncData(() => dashboardService.getHomeStats(), [])
  const { data: renewableKPIs } = useAsyncData(() => dashboardService.getRenewableKPIs(), [])
  const { data: news, loading: newsLoading } = useAsyncData(() => newsService.getAll(), [])
  const { data: consultations } = useAsyncData(() => consultationService.getActive(), [])
  const { data: projects } = useAsyncData(() => projectService.getFeatured(), [])
  const { data: installers } = useAsyncData(() => installerService.getAll(), [])

  const latestNews = news?.slice(0, 4) ?? []
  const activeConsultations = consultations ?? []
  const topInstallers = installers?.slice(0, 3) ?? []

  const dashboardHighlights = renewableKPIs?.slice(0, 4) ?? []

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
                  <Button to={item.to} variant="outline" size="sm" className="mt-3">
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
                  <KPIWidget
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    unit={stat.unit}
                    change={stat.change ? parseFloat(stat.change) : undefined}
                  />
                ))}
          </div>
        </div>
      </section>

      <EnergyAwarenessGuides stats={stats} loading={statsLoading} />

      <section className="section-padding bg-slate-100/80" aria-labelledby="spotlight-heading">
        <div className="container-page">
          <SectionHeading title="Spotlight" subtitle="Featured programmes and tools from across the platform" align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeSpotlights.map((spot) => (
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

      <section className="section-padding bg-gradient-to-br from-navy-900 via-[#2E5496] to-teal-900 text-white" aria-labelledby="dashboard-preview-heading">
        <div className="container-page">
          <motion.div {...fadeUp} className="grid items-center gap-6 lg:grid-cols-2">
            <div>
              <h2 id="dashboard-preview-heading" className="text-white">
                Data, Dashboards & GIS
              </h2>
              <p className="mt-2 text-body-small text-slate-300">
                Track installed capacity, solar growth, EV adoption, and renewable penetration. Explore installations on our interactive Bermuda heat map.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button to={ROUTES.renewableDashboard} variant="primary">Renewable Dashboard</Button>
                <Button to={ROUTES.transitionDashboard} variant="outline" className="border-white/60 text-white hover:bg-white/10">
                  Transition Dashboard
                </Button>
                <Button to={ROUTES.gis} variant="outline" className="border-white/60 text-white hover:bg-white/10">
                  GIS Heat Map
                </Button>
                <Button to={ROUTES.registry} variant="outline" className="border-white/60 text-white hover:bg-white/10">
                  Energy Registry
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {dashboardHighlights.map((item, index) => {
                const highlightImages = [
                  PAGE_IMAGES.solar,
                  PAGE_IMAGES.solar,
                  PAGE_IMAGES.battery,
                  PAGE_IMAGES.wind,
                ]
                return (
                <div key={item.label} className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <SafeImage
                    src={highlightImages[index]}
                    alt=""
                    className="h-16 w-full object-cover opacity-80"
                  />
                  <div className="p-4 pt-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="mt-1 text-h3 font-bold text-white">
                    {item.value}
                    {item.unit && <span className="ml-1 text-sm font-medium text-slate-300">{item.unit}</span>}
                  </p>
                  </div>
                </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white" aria-labelledby="installers-heading">
        <div className="container-page">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading title="Registered Solar Installers" subtitle="Certified professionals for your renewable energy project" className="mb-0" />
            <Button to={ROUTES.installers} variant="outline">View All Installers</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {topInstallers.map((installer) => (
              <InstallerCard key={installer.id} installer={installer} />
            ))}
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
          <div className="grid gap-4 md:grid-cols-2">
            {activeConsultations.map((con) => (
              <motion.article key={con.id} {...fadeUp} className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
                <div className="aspect-[16/9] overflow-hidden">
                  <SafeImage
                    src={resolveContentImage(con.image, 'consultation')}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="card-padding">
                <Badge status="active">Active</Badge>
                <h3 className="mt-2">{con.title}</h3>
                <p className="mt-1.5 text-body-small text-slate-600">{con.summary}</p>
                <p className="mt-3 text-xs text-slate-500">Closes {formatDate(con.closingDate)}</p>
                {con.documents?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {con.documents.map((doc) => (
                      <button
                        key={doc.title}
                        type="button"
                        onClick={() => downloadMockDocument({ title: doc.title, summary: con.summary, category: 'Consultation' })}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-teal-700 transition-colors hover:border-teal-300 hover:bg-teal-50"
                      >
                        {doc.title}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button href={EXTERNAL_LINKS.consultationsForum} variant="primary" size="sm" target="_blank" rel="noopener noreferrer">
                    Submit Response
                  </Button>
                  <Button to={ROUTES.consultations} variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-100/80" aria-labelledby="quick-access-heading">
        <div className="container-page">
          <SectionHeading title="Quick Access" subtitle="Jump to key sections of energy.bm" align="center" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {homeQuickAccess.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-1 hover:border-teal-300 hover:card-shadow-hover"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={link.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="p-3 text-center text-sm font-semibold text-navy-900">{link.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-teal-700" aria-labelledby="cta-heading">
        <div className="container-page text-center">
          <h2 id="cta-heading" className="text-white">Get in Touch</h2>
          <p className="mx-auto mt-2 max-w-xl text-body-small text-teal-100">
            Questions about energy policy, renewable programmes, or consultations? Our team is here to help.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button to={ROUTES.contact} variant="gold" size="lg">Contact the Department</Button>
            <Button to={ROUTES.about} variant="outline" size="lg" className="border-white/60 text-white hover:bg-white/10">
              About Us
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
