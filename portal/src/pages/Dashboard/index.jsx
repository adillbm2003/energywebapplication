import { Link } from 'react-router-dom'
import PageBanner from '../../components/common/PageBanner'
import SafeImage from '../../components/common/SafeImage'
import SectionHeading from '../../components/ui/SectionHeading'
import { PAGE_IMAGES } from '../../constants/branding'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'

const QUICK_ACCESS = [
  { label: 'Renewable Dashboard', to: ROUTES.renewableDashboard, image: PAGE_IMAGES.renewableDashboard },
  { label: 'Transition Dashboard', to: ROUTES.transitionDashboard, image: PAGE_IMAGES.transitionDashboard },
  { label: 'Energy Registry', to: ROUTES.registry, image: PAGE_IMAGES.registry },
  { label: 'GIS Solar PV Map', to: ROUTES.gis, image: PAGE_IMAGES.gisHeatmap },
  { label: 'Education Centre', to: ROUTES.education, image: PAGE_IMAGES.education },
  { label: 'Energy Simulator', href: 'https://simulator.energy.bm/', image: PAGE_IMAGES.simulator },
]

export default function Dashboard() {
  useDocumentTitle('Dashboards')

  return (
    <>
      <PageBanner
        title="Energy Dashboards"
        subtitle="Choose a dashboard, or jump straight to the registry, the solar map or the simulator."
        breadcrumbs={[{ label: 'Dashboards', to: ROUTES.dashboard }]}
        image={PAGE_IMAGES.solar}
      />

      <section className="border-b border-slate-200 bg-slate-50/80 py-6">
        <div className="container-page">
          <SectionHeading title="Quick Access" subtitle="Jump to dashboards, data tools, and resources" className="mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_ACCESS.map((item) => {
              const cardClass = "group overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:card-shadow-hover"
              const inner = (
                <>
                  <SafeImage
                    src={item.image}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <p className="p-2.5 text-center text-caption font-semibold text-navy-900">{item.label}</p>
                </>
              )
              return item.href ? (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                  {inner}
                </a>
              ) : (
                <Link key={item.to} to={item.to} className={cardClass}>
                  {inner}
                </Link>
              )
            })}
          </div>
        </div>
      </section>


    </>
  )
}
