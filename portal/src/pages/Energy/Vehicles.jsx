import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PageBanner from '../../components/common/PageBanner'
import SectionHeading from '../../components/ui/SectionHeading'
import { PAGE_IMAGES } from '../../constants/branding'
import { ROUTES } from '../../constants/routes'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const CATEGORY_COLORS = {
  'Private Cars': '#16a34a',
  'Rental Mini-Cars': '#0891b2',
  'Motorcycles & Cycles': '#7c3aed',
  'Trucks': '#f97316',
  'Buses (Omnibus)': '#2563eb',
  'Government Vehicles': '#0f766e',
  'Taxis & Other': '#6b7280',
}

const CATEGORY_ICONS = {
  'Private Cars': '🚗',
  'Rental Mini-Cars': '🚙',
  'Motorcycles & Cycles': '🏍️',
  'Trucks': '🚛',
  'Buses (Omnibus)': '🚌',
  'Government Vehicles': '🏛️',
  'Taxis & Other': '🚕',
}

function EvFleetChart({ fleet }) {
  const categories = Object.entries(fleet.byCategory)
  const max = Math.max(...categories.map(([, v]) => v))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white card-shadow p-6 md:p-8">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-navy-900">Electric Vehicle Fleet — Live from Registry</h3>
          <p className="text-sm text-slate-500 mt-0.5">As at {fleet.asOf} · Fuel type: {fleet.fuelType}</p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-700 border border-teal-200">
          {fleet.total.toLocaleString()} EVs Registered
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {categories.map(([cat, count]) => (
          <div key={cat}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span>{CATEGORY_ICONS[cat] || '🚘'}</span>
                {cat}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-bold text-navy-900">{count.toLocaleString()}</span>
                <span className="text-xs text-slate-400">({((count / fleet.total) * 100).toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: CATEGORY_COLORS[cat] || '#0891b2' }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Source: Department of Energy — Vehicles by Fuel Type Registry.
      </p>
    </div>
  )
}

function TopMakesTable({ makes }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white card-shadow p-6">
      <h3 className="mb-4 text-navy-900">Top EV Makes in Bermuda</h3>
      <div className="space-y-2">
        {makes.map(({ make, count }, i) => (
          <div key={make} className="flex items-center gap-3">
            <span className="w-6 text-center text-sm font-bold text-slate-400">#{i + 1}</span>
            <span className="flex-1 text-sm font-medium text-slate-700">{make.trim()}</span>
            <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-bold text-navy-800">
              {count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, sub }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white card-shadow p-5">
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-3xl font-bold text-teal-700">{value}</span>
      <span className="mt-1 text-sm font-semibold text-navy-900">{label}</span>
      {sub && <span className="mt-0.5 text-xs text-slate-500">{sub}</span>}
    </div>
  )
}

const PRIORITIES = [
  'Supporting electric vehicle adoption and charging infrastructure planning',
  "Tracking the island's vehicle fleet composition by fuel type",
  'Promoting efficient transport choices for residents and businesses',
  "Aligning transport policy with Bermuda's wider energy transition goals",
]

export default function Vehicles() {
  useDocumentTitle('Vehicles')

  const [fleet, setFleet] = useState(null)
  const [fleetLoading, setFleetLoading] = useState(true)
  const [fleetError, setFleetError] = useState(null)

  useEffect(() => {
    fetch('/api/vehicles/fleet')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => setFleet(data))
      .catch(err => setFleetError(String(err)))
      .finally(() => setFleetLoading(false))
  }, [])

  return (
    <>
      <PageBanner
        title="Vehicles & Transport Energy"
        subtitle="Live data on Bermuda's registered electric vehicle fleet, fuel types, and the Department's work to support cleaner transport."
        breadcrumbs={[
          { label: 'Energy', to: ROUTES.energy },
          { label: 'Vehicles', to: ROUTES.vehicles },
        ]}
        image={PAGE_IMAGES.ev}
      />

      {/* Intro + download card */}
      <section className="section-padding">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading title="Transport & Energy" className="mb-4" />
              <p className="text-slate-600 leading-relaxed">
                Transport is a significant part of Bermuda's energy use. The Department of Energy monitors vehicle
                registration trends, fuel types, and the shift toward electric and hybrid options as part of the
                island's broader energy strategy.
              </p>
              <ul className="mt-6 space-y-3">
                {PRIORITIES.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-navy-900 to-teal-900 text-white card-shadow">
              <img src={PAGE_IMAGES.charging} alt="" className="h-44 w-full object-cover opacity-90" loading="lazy" />
              <div className="card-padding">
                <h3>Cleaner Transport for Bermuda</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  The Department of Energy tracks Bermuda's vehicle fleet to support transport policy, EV incentive programmes, and infrastructure planning for a sustainable island.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live fleet data section */}
      <section className="section-padding bg-slate-50">
        <div className="container-page">
          <SectionHeading
            title="Bermuda Electric Vehicle Fleet"
            subtitle="Live statistics computed from the official vehicle registry"
          />

          {fleetLoading && <LoadingSpinner />}

          {fleetError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Unable to load fleet data: {fleetError}
            </div>
          )}

          {fleet && (
            <>
              {/* KPI summary row */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon="⚡"
                  label="Total EVs Registered"
                  value={fleet.total.toLocaleString()}
                  sub={`As at ${fleet.asOf}`}
                />
                <StatCard
                  icon="🚗"
                  label="Private Cars"
                  value={fleet.byCategory['Private Cars'].toLocaleString()}
                  sub={`${((fleet.byCategory['Private Cars'] / fleet.total) * 100).toFixed(1)}% of fleet`}
                />
                <StatCard
                  icon="🚙"
                  label="Rental Mini-Cars"
                  value={fleet.byCategory['Rental Mini-Cars'].toLocaleString()}
                  sub={`${((fleet.byCategory['Rental Mini-Cars'] / fleet.total) * 100).toFixed(1)}% of fleet`}
                />
                <StatCard
                  icon="🏍️"
                  label="Motorcycles & Cycles"
                  value={fleet.byCategory['Motorcycles & Cycles'].toLocaleString()}
                  sub={`${((fleet.byCategory['Motorcycles & Cycles'] / fleet.total) * 100).toFixed(1)}% of fleet`}
                />
              </div>

              {/* Bar chart + Top makes */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <EvFleetChart fleet={fleet} />
                </div>
                <TopMakesTable makes={fleet.topMakes} />
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <p className="text-body-small text-slate-500">
            For consumer guidance on efficient vehicle choices, visit the{' '}
            <Link to={ROUTES.education} className="font-medium text-teal-700 hover:text-teal-800">
              Education Centre
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
