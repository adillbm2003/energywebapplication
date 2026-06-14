import { Link, NavLink, Outlet } from 'react-router-dom'
import PageBanner from '../../components/common/PageBanner'
import SafeImage from '../../components/common/SafeImage'
import SectionHeading from '../../components/ui/SectionHeading'
import { PAGE_IMAGES } from '../../constants/branding'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'
import { cn } from '../../utils/cn'

const TABS = [
  { label: 'Renewable Energy', to: ROUTES.renewableDashboard },
  { label: 'Energy Transition', to: ROUTES.transitionDashboard },
]

const QUICK_ACCESS = [
  { label: 'Renewable Dashboard', to: ROUTES.renewableDashboard, image: PAGE_IMAGES.solar },
  { label: 'Transition Dashboard', to: ROUTES.transitionDashboard, image: PAGE_IMAGES.ev },
  { label: 'Energy Registry', to: ROUTES.registry, image: PAGE_IMAGES.registry },
  { label: 'GIS Heat Map', to: ROUTES.gis, image: PAGE_IMAGES.grid },
  { label: 'Education Centre', to: ROUTES.education, image: PAGE_IMAGES.education },
  { label: 'Energy Simulator', to: ROUTES.simulator, image: PAGE_IMAGES.simulator },
]

export default function Dashboard() {
  useDocumentTitle('Dashboards')

  return (
    <>
      <PageBanner
        title="Energy Dashboards"
        subtitle="Interactive data on Bermuda's renewable energy and energy transition progress."
        breadcrumbs={[{ label: 'Dashboards', to: ROUTES.dashboard }]}
        image={PAGE_IMAGES.solar}
      />

      <section className="border-b border-slate-200 bg-slate-50/80 py-6">
        <div className="container-page">
          <SectionHeading title="Quick Access" subtitle="Jump to dashboards, data tools, and resources" className="mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_ACCESS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:card-shadow-hover"
              >
                <SafeImage
                  src={item.image}
                  alt=""
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <p className="p-2.5 text-center text-caption font-semibold text-navy-900">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="border-b border-slate-200 bg-white">
        <div className="container-page">
          <nav aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <Outlet />
    </>
  )
}
