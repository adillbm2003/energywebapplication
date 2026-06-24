import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Link } from 'react-router-dom'
import KPIWidget from '../../components/dashboard/KPIWidget'
import EnergyChart from '../../components/dashboard/EnergyChart'
import SolarChart from '../../components/dashboard/SolarChart'
import DashboardFilters from '../../components/dashboard/DashboardFilters'
import DashboardPanelImage from '../../components/dashboard/DashboardPanelImage'
import SafeImage from '../../components/common/SafeImage'
import SectionHeading from '../../components/ui/SectionHeading'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { dashboardService } from '../../services'
import { PAGE_IMAGES } from '../../constants/branding'
import { ROUTES } from '../../constants/routes'

const ENERGY_TOPICS = [
  {
    title: 'Solar Photovoltaic',
    description: 'Over 1,200 residential and commercial solar installations across Bermuda, generating 25+ MW of clean energy.',
    image: PAGE_IMAGES.solarRooftop,
    stat: '25.4 MW',
    statLabel: 'Installed Capacity',
    to: ROUTES.registry,
    accent: '#C9A227',
  },
  {
    title: 'Wind Energy',
    description: "Offshore and onshore wind resources being assessed as a key contributor to Bermuda's long-term renewable mix.",
    image: PAGE_IMAGES.wind,
    stat: '3.2 MW',
    statLabel: 'Capacity Target',
    to: ROUTES.renewableDashboard,
    accent: '#0077B6',
  },
  {
    title: 'Battery Storage',
    description: 'Grid-scale battery systems providing 3.2 MWh of storage, enabling higher renewable penetration and grid stability.',
    image: PAGE_IMAGES.battery,
    stat: '3.2 MWh',
    statLabel: 'Grid Storage',
    to: ROUTES.renewableDashboard,
    accent: '#2E5496',
  },
  {
    title: 'Grid Modernisation',
    description: 'Smart grid infrastructure upgrades supporting distributed generation, demand response, and energy resilience.',
    image: PAGE_IMAGES.grid,
    stat: '12.8%',
    statLabel: 'Renewable Share',
    to: ROUTES.gis,
    accent: '#10b981',
  },
]

const TARGETS = [
  {
    label: 'Renewable Penetration (2025 target)',
    current: 12.8,
    target: 25,
    unit: '%',
    color: '#0077B6',
    note: 'Aspirational interim target',
  },
  {
    label: 'Long-term Renewable Goal (2035 target)',
    current: 12.8,
    target: 85,
    unit: '%',
    color: '#C9A227',
    note: "Bermuda's national clean energy goal",
  },
  {
    label: 'Solar Installations (2028 target)',
    current: 1245,
    target: 2000,
    unit: '',
    color: '#10b981',
    note: 'Residential & commercial combined',
  },
]

function StatChip({ value, label, positive = true }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {positive && <p className="mt-0.5 text-xs font-semibold text-teal-300">↑ increasing</p>}
    </div>
  )
}

export default function RenewableDashboard() {
  useDocumentTitle('Renewable Energy Dashboard')
  const [year, setYear] = useState('all')

  const { data: kpis, loading: kpiLoading } = useAsyncData(() => dashboardService.getRenewableKPIs(), [])
  const { data: solarGrowth } = useAsyncData(() => dashboardService.getSolarGrowth(), [])
  const { data: capacityByType } = useAsyncData(() => dashboardService.getCapacityByType(), [])
  const { data: batteryData } = useAsyncData(() => dashboardService.getBatteryStorage(), [])
  const { data: penetration } = useAsyncData(() => dashboardService.getPenetration(), [])

  const years = solarGrowth?.map((d) => d.year) ?? []
  const filteredSolar = year === 'all' ? solarGrowth : solarGrowth?.filter((d) => String(d.year) === year)
  const filteredPenetration = year === 'all' ? penetration : penetration?.filter((d) => String(d.year) === year)

  if (kpiLoading) return <LoadingSpinner />

  return (
    <div>
      {/* ── Hero Banner ───────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0B1F3A]">
        <SafeImage
          src={PAGE_IMAGES.solarCommercial}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/95 via-[#0B1F3A]/70 to-transparent" />
        <div className="container-page relative py-12 md:py-16">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-teal-400">Live Data · Updated Regularly</p>
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Renewable Energy<br className="hidden md:block" /> Dashboard
          </h2>
          <p className="mt-3 max-w-lg text-base text-slate-300">
            Real-time tracking of solar capacity, grid storage, and renewable penetration across Bermuda's electricity network.
          </p>
          {kpis && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {kpis.map((kpi) => (
                <StatChip
                  key={kpi.label}
                  value={`${typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}${kpi.unit ? ' ' + kpi.unit : ''}`}
                  label={kpi.label}
                  positive={(kpi.change ?? 0) > 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="section-padding">
        <div className="container-page space-y-14">

          {/* ── Time Period Filter ─────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
            <p className="text-sm text-slate-500">Filter charts by year or view all-time trends.</p>
            <DashboardFilters year={year} onYearChange={setYear} years={years} />
          </div>

          {/* ── KPI Cards ─────────────────────────────────────── */}
          <div>
            <SectionHeading
              title="Key Performance Indicators"
              subtitle="Bermuda's renewable energy metrics — current year snapshot"
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

          {/* ── Charts Row 1: Growth + Capacity ───────────────── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
              <DashboardPanelImage src={PAGE_IMAGES.solar} />
              <div className="card-padding">
                <SectionHeading
                  title="Solar Growth"
                  subtitle="Installed capacity (MW) and total installations per year"
                  className="mb-4"
                />
                <SolarChart data={filteredSolar ?? []} />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
              <DashboardPanelImage src={PAGE_IMAGES.analytics} />
              <div className="card-padding">
                <SectionHeading
                  title="Capacity by Technology"
                  subtitle="Share of total installed renewable capacity by sector"
                  className="mb-4"
                />
                <div className="h-72" role="img" aria-label="Capacity distribution by technology type">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={capacityByType}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={64}
                        outerRadius={104}
                        paddingAngle={3}
                        label={({ name, value }) => `${value}%`}
                        labelLine={false}
                      >
                        {capacityByType?.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ── Charts Row 2: Battery + Penetration ───────────── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
              <DashboardPanelImage src={PAGE_IMAGES.battery} />
              <div className="card-padding">
                <SectionHeading
                  title="Battery Storage Capacity"
                  subtitle="Grid-connected energy storage deployment (MWh) by quarter"
                  className="mb-4"
                />
                <EnergyChart
                  data={batteryData}
                  dataKey="capacity"
                  xKey="quarter"
                  label="Capacity (MWh)"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
              <DashboardPanelImage src={PAGE_IMAGES.wind} />
              <div className="card-padding">
                <SectionHeading
                  title="Renewable Penetration"
                  subtitle="Renewables as a percentage of total electricity generation"
                  className="mb-4"
                />
                <EnergyChart
                  data={filteredPenetration}
                  dataKey="penetration"
                  label="Penetration (%)"
                  targetLine={25}
                  targetLabel="2025 Target (25%)"
                />
              </div>
            </div>
          </div>

          {/* ── Progress Toward Targets ───────────────────────── */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
            <div className="relative h-36 overflow-hidden">
              <SafeImage src={PAGE_IMAGES.grid} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/90 to-[#0B1F3A]/50 flex flex-col justify-center px-6 md:px-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400">Bermuda's Pathway</p>
                <h3 className="mt-1 text-2xl font-bold text-white">Clean Energy Targets</h3>
                <p className="mt-1 text-sm text-slate-300">Tracking progress toward a sustainable energy future</p>
              </div>
            </div>
            <div className="px-6 py-6 md:px-8 space-y-6">
              {TARGETS.map((t) => {
                const pct = Math.min(100, Math.round((t.current / t.target) * 100))
                return (
                  <div key={t.label}>
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="text-sm font-semibold text-slate-800">{t.label}</span>
                      <span className="text-xs text-slate-400">{t.note}</span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: t.color, transition: 'width 0.8s ease' }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Current: <strong>{t.current}{t.unit}</strong>
                        <span className="mx-2 text-slate-300">·</span>
                        Target: <strong>{t.target}{t.unit}</strong>
                      </span>
                      <span className="font-bold" style={{ color: t.color }}>{pct}% achieved</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Renewable Technology Topic Cards ─────────────── */}
          <div>
            <SectionHeading
              title="Renewable Energy Technologies"
              subtitle="Bermuda's clean energy portfolio — solar, wind, storage, and grid modernisation"
              className="mb-6"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ENERGY_TOPICS.map((topic) => (
                <Link
                  key={topic.title}
                  to={topic.to}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all duration-300 hover:-translate-y-1 hover:card-shadow-hover"
                >
                  <div className="relative h-44 overflow-hidden">
                    <SafeImage
                      src={topic.image}
                      alt={topic.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-3">
                      <p className="text-2xl font-bold text-white leading-tight">{topic.stat}</p>
                      <p className="text-xs font-medium text-white/75">{topic.statLabel}</p>
                    </div>
                    <div
                      className="absolute right-0 top-0 h-1 w-full opacity-80"
                      style={{ background: `linear-gradient(to right, transparent, ${topic.accent})` }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="mb-2 font-semibold text-navy-900 group-hover:text-teal-700 transition-colors">
                      {topic.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-500">{topic.description}</p>
                    <p className="mt-3 text-xs font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
                      View details →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
