import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { Link } from 'react-router-dom'
import KPIWidget from '../../components/dashboard/KPIWidget'
import EVChart from '../../components/dashboard/EVChart'
import DashboardPanelImage from '../../components/dashboard/DashboardPanelImage'
import SafeImage from '../../components/common/SafeImage'
import SectionHeading from '../../components/ui/SectionHeading'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { dashboardService } from '../../services'
import { formatNumber } from '../../utils/format'
import { PAGE_IMAGES } from '../../constants/branding'
import { ROUTES } from '../../constants/routes'

const EV_TOPIC_IMAGES = {
  'Passenger Cars': PAGE_IMAGES.ev,
  'Commercial Vans': PAGE_IMAGES.van,
  'Motorcycles': PAGE_IMAGES.motorcycle,
  'Buses & Fleet': PAGE_IMAGES.bus,
}
const EV_TOPIC_COLORS = {
  'Passenger Cars': '#0077B6',
  'Commercial Vans': '#C9A227',
  'Motorcycles': '#10b981',
  'Buses & Fleet': '#2E5496',
}

const MILESTONES = [
  {
    label: 'EV Registrations',
    current: 1847,
    target: 3000,
    unit: '',
    color: '#0077B6',
    note: '3,000 registered EVs by 2026',
  },
  {
    label: 'Public Charging Points',
    current: 48,
    target: 100,
    unit: '',
    color: '#C9A227',
    note: '100 public charging points by 2025',
  },
  {
    label: 'Fleet Electrification',
    current: 22,
    target: 50,
    unit: '%',
    color: '#10b981',
    note: "50% fleet electrification by 2030",
  },
  {
    label: 'Electric Public Buses',
    current: 14,
    target: 60,
    unit: '',
    color: '#2E5496',
    note: '60 electric buses in service by 2030',
  },
]

function StatChip({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-teal-300">↑ increasing</p>
    </div>
  )
}

export default function TransitionDashboard() {
  useDocumentTitle('Energy Transition Dashboard')

  const { data: kpis, loading } = useAsyncData(() => dashboardService.getTransitionKPIs(), [])
  const { data: evDataRaw } = useAsyncData(() => dashboardService.getEVAdoption(), [])
  const evData = evDataRaw ? [...evDataRaw].sort((a, b) => Number(a.year) - Number(b.year)) : evDataRaw
  const { data: evCategories } = useAsyncData(() => dashboardService.getEVByCategory(), [])
  const { data: charging } = useAsyncData(() => dashboardService.getChargingInfrastructure(), [])
  const { data: transport } = useAsyncData(() => dashboardService.getPublicTransport(), [])
  const { data: efficiency } = useAsyncData(() => dashboardService.getEfficiencyMetrics(), [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0B1F3A]">
        <SafeImage
          src={PAGE_IMAGES.transport}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/95 via-[#0B1F3A]/70 to-transparent" />
        <div className="container-page relative py-12 md:py-16">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-teal-400">Live Data · Energy Transition</p>
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Energy Transition<br className="hidden md:block" /> Dashboard
          </h2>
          <p className="mt-3 max-w-lg text-base text-slate-300">
            Tracking Bermuda's shift to electric vehicles, clean public transport, and a more efficient built environment.
          </p>
          {kpis && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {kpis.map((kpi) => (
                <StatChip
                  key={kpi.label}
                  value={`${typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}${kpi.unit ? ' ' + kpi.unit : ''}`}
                  label={kpi.label}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="section-padding">
        <div className="container-page space-y-14">

          {/* ── KPI Cards ─────────────────────────────────────────────── */}
          <div>
            <SectionHeading
              title="Key Performance Indicators"
              subtitle="Bermuda's energy transition metrics — current snapshot"
              className="mb-5"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis?.map((kpi) => (
                <KPIWidget
                  key={kpi.label}
                  label={kpi.label}
                  value={kpi.value}
                  unit={kpi.unit}
                  change={kpi.change}
                  image={kpi.image}
                />
              ))}
            </div>
          </div>

          {/* ── EV Vehicle Type Cards ─────────────────────────────────── */}
          <div>
            <SectionHeading
              title="EV Adoption by Vehicle Category"
              subtitle="Registered electric vehicles across Bermuda by type"
              className="mb-5"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {evCategories?.map((cat) => {
                const accent = EV_TOPIC_COLORS[cat.category] || '#0077B6'
                return (
                  <div
                    key={cat.category}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <SafeImage
                        src={EV_TOPIC_IMAGES[cat.category] || PAGE_IMAGES.ev}
                        alt={cat.category}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-3">
                        <p className="text-2xl font-bold text-white leading-tight">{formatNumber(cat.count)}</p>
                        <p className="text-xs font-medium text-white/75">registered</p>
                      </div>
                      <div
                        className="absolute right-0 top-0 h-1 w-full"
                        style={{ background: `linear-gradient(to right, transparent, ${accent})` }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="mb-2 text-sm font-semibold text-navy-900">{cat.category}</h4>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cat.percent}%`, backgroundColor: accent }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">{cat.percent}% of all registered EVs</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── EV Growth + Category Breakdown ────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
              <DashboardPanelImage src={PAGE_IMAGES.ev} />
              <div className="card-padding">
                <SectionHeading
                  title="EV Adoption Over Time"
                  subtitle="Electric vehicles and hybrids registered annually"
                  className="mb-4"
                />
                <EVChart data={evData ?? []} />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
              <DashboardPanelImage src={PAGE_IMAGES.analytics} />
              <div className="card-padding">
                <SectionHeading
                  title="Fleet Breakdown by Category"
                  subtitle="Total registered EVs per vehicle type"
                  className="mb-4"
                />
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={evCategories} layout="vertical" margin={{ left: 20, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                      <Bar dataKey="count" name="Vehicles" radius={[0, 5, 5, 0]}>
                        {evCategories?.map((entry) => (
                          <Cell key={entry.category} fill={EV_TOPIC_COLORS[entry.category] || '#0077B6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ── Charging Infrastructure ───────────────────────────────── */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
            <div className="relative h-36 overflow-hidden">
              <SafeImage src={PAGE_IMAGES.charging} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/90 to-[#0B1F3A]/40 flex flex-col justify-center px-6 md:px-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400">Infrastructure</p>
                <h3 className="mt-1 text-2xl font-bold text-white">EV Charging by Parish</h3>
                <p className="mt-1 text-sm text-slate-300">Level 2 and fast charging points across Bermuda's parishes</p>
              </div>
            </div>
            <div className="card-padding">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charging} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="parish" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend />
                    <Bar dataKey="level2" name="Level 2 Chargers" fill="#0077B6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fast" name="Fast Charging" fill="#C9A227" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Public Transport Electrification ─────────────────────── */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
            <div className="relative h-36 overflow-hidden">
              <SafeImage src={PAGE_IMAGES.bus} alt="" className="h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/90 to-[#0B1F3A]/40 flex flex-col justify-center px-6 md:px-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400">Public Fleet</p>
                <h3 className="mt-1 text-2xl font-bold text-white">Public Transport Electrification</h3>
                <p className="mt-1 text-sm text-slate-300">Shift from diesel to electric and hybrid buses in Bermuda's public fleet</p>
              </div>
            </div>
            <div className="card-padding">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transport} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend />
                    <Bar dataKey="electric" name="Electric" stackId="a" fill="#0077B6" />
                    <Bar dataKey="hybrid" name="Hybrid" stackId="a" fill="#C9A227" />
                    <Bar dataKey="diesel" name="Diesel" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Energy Efficiency Metrics ─────────────────────────────── */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
            <div className="relative h-36 overflow-hidden">
              <SafeImage src={PAGE_IMAGES.efficiency} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/90 to-[#0B1F3A]/40 flex flex-col justify-center px-6 md:px-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400">Efficiency</p>
                <h3 className="mt-1 text-2xl font-bold text-white">Energy Efficiency Progress</h3>
                <p className="mt-1 text-sm text-slate-300">Indexed against a 2019 baseline of 100 — lower is better</p>
              </div>
            </div>
            <div className="px-6 py-6 md:px-8 space-y-5">
              {efficiency?.map((item) => {
                const pct = Math.round(((item.baseline - item.current) / item.baseline) * 100)
                const toTarget = Math.round(((item.baseline - item.target) / item.baseline) * 100)
                return (
                  <div key={item.metric}>
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="text-sm font-semibold text-slate-800">{item.metric}</span>
                      <span className="text-xs text-slate-400">Target index: {item.target}</span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="absolute top-0 z-10 h-full w-0.5 bg-amber-400"
                        style={{ left: `${toTarget}%` }}
                      />
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Current: <strong>{item.current}</strong>
                        <span className="mx-2 text-slate-300">·</span>
                        Baseline: <strong>{item.baseline}</strong>
                      </span>
                      <span className="font-bold text-teal-600">{pct}% reduction achieved</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Transition Milestones ─────────────────────────────────── */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
            <div className="relative h-36 overflow-hidden">
              <SafeImage src={PAGE_IMAGES.van} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/90 to-[#0B1F3A]/40 flex flex-col justify-center px-6 md:px-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400">Bermuda's Pathway</p>
                <h3 className="mt-1 text-2xl font-bold text-white">Transition Milestones</h3>
                <p className="mt-1 text-sm text-slate-300">Progress toward Bermuda's clean transport and efficiency targets</p>
              </div>
            </div>
            <div className="px-6 py-6 md:px-8 space-y-6">
              {MILESTONES.map((m) => {
                const pct = Math.min(100, Math.round((m.current / m.target) * 100))
                return (
                  <div key={m.label}>
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="text-sm font-semibold text-slate-800">{m.label}</span>
                      <span className="text-xs text-slate-400">{m.note}</span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: m.color }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Current: <strong>{formatNumber(m.current)}{m.unit}</strong>
                        <span className="mx-2 text-slate-300">·</span>
                        Target: <strong>{formatNumber(m.target)}{m.unit}</strong>
                      </span>
                      <span className="font-bold" style={{ color: m.color }}>{pct}% achieved</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Quick Links ───────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'View EV Fleet Data', to: ROUTES.vehicles, image: PAGE_IMAGES.ev, desc: 'Live EV registry by make, model and fuel type' },
              { label: 'GIS Heat Map', to: ROUTES.gis, image: PAGE_IMAGES.grid, desc: 'Solar installation locations across Bermuda' },
              { label: 'Renewable Dashboard', to: ROUTES.renewableDashboard, image: PAGE_IMAGES.solar, desc: 'Solar capacity, storage and penetration data' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-0.5 hover:card-shadow-hover"
              >
                <SafeImage src={link.image} alt="" className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="p-4">
                  <h4 className="font-semibold text-navy-900 group-hover:text-teal-700 transition-colors">{link.label}</h4>
                  <p className="mt-1 text-sm text-slate-500">{link.desc}</p>
                  <p className="mt-2 text-xs font-semibold text-teal-600">Explore →</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>
    </div>
  )
}
