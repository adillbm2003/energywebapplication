import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageBanner from '../../components/common/PageBanner'
import Button from '../../components/ui/Button'
import KPIWidget from '../../components/dashboard/KPIWidget'
import EVChart from '../../components/dashboard/EVChart'
import DashboardPanelImage from '../../components/dashboard/DashboardPanelImage'
import SafeImage from '../../components/common/SafeImage'
import SectionHeading from '../../components/ui/SectionHeading'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { dashboardService } from '../../services'
import { formatNumber } from '../../utils/format'
import { PAGE_IMAGES } from '../../constants/branding'
import { ROUTES } from '../../constants/routes'
import { transitionKPIs, evAdoptionData, evByCategory } from '../../data/dashboard'

export default function TransitionDashboard() {
  useDocumentTitle('Energy Transition Dashboard')

  const { data: kpis } = useAsyncData(() => dashboardService.getTransitionKPIs(), [], transitionKPIs)
  const { data: evData } = useAsyncData(() => dashboardService.getEVAdoption(), [], evAdoptionData)
  const { data: evCategories } = useAsyncData(() => dashboardService.getEVByCategory(), [], evByCategory)

  return (
    <>
      {/* See RenewableDashboard: this was the other tab, and now stands alone. */}
      <PageBanner
        title="Energy Transition Dashboard"
        subtitle="Electric vehicle adoption across Bermuda, by category and over time."
        breadcrumbs={[
          { label: 'Data & GIS', to: ROUTES.dashboard },
          { label: 'Energy Transition', to: ROUTES.transitionDashboard },
        ]}
        image={PAGE_IMAGES.electricBus}
      />

      <section className="section-padding">
      <div className="container-page space-y-10">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis?.map((kpi) => (
            <KPIWidget
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              image={kpi.image}
            />
          ))}
        </div>

        <div>
          <SectionHeading title="EV Adoption by Category" subtitle="Registered electric vehicles by vehicle type" className="mb-6" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {evCategories?.map((cat) => (
              <article key={cat.category} className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
                <SafeImage src={cat.image} alt="" className="h-32 w-full object-cover" />
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-navy-900">{cat.category}</h3>
                  <p className="mt-1 text-2xl font-bold text-teal-700">{formatNumber(cat.count)}</p>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all" style={{ width: `${cat.percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{cat.percent}% of registered EVs</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
            <DashboardPanelImage src={PAGE_IMAGES.ev} />
            <div className="card-padding">
              <SectionHeading title="EV Adoption Over Time" className="mb-4" />
              <EVChart data={evData ?? []} />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
            <DashboardPanelImage src={PAGE_IMAGES.analytics} />
            <div className="card-padding">
              <SectionHeading title="Category Breakdown" className="mb-4" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...(evCategories || [])].reverse()} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Vehicles" fill="#0077B6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

      <section className="section-padding bg-slate-50 pt-0">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white card-padding card-shadow">
            <div>
              <p className="text-body-small font-semibold text-navy-900">Looking for solar capacity and battery storage?</p>
              <p className="text-caption text-slate-600">Those figures live on the Renewable Energy Dashboard.</p>
            </div>
            <Button to={ROUTES.renewableDashboard} variant="outline">Renewable Energy Dashboard</Button>
          </div>
        </div>
      </section>
    </>
  )
}
