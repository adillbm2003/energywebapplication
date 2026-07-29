import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import KPIWidget from '../../components/dashboard/KPIWidget'
import EnergyChart from '../../components/dashboard/EnergyChart'
import SolarChart from '../../components/dashboard/SolarChart'
import DashboardFilters from '../../components/dashboard/DashboardFilters'
import DashboardPanelImage from '../../components/dashboard/DashboardPanelImage'
import SafeImage from '../../components/common/SafeImage'
import SectionHeading from '../../components/ui/SectionHeading'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { dashboardService } from '../../services'
import { PAGE_IMAGES } from '../../constants/branding'
import { renewableKPIs, solarGrowthData, capacityByType as defaultCapacity, batteryStorageData, penetrationData } from '../../data/dashboard'

export default function RenewableDashboard() {
  useDocumentTitle('Renewable Energy Dashboard')
  const [year, setYear] = useState('all')

  const { data: kpis } = useAsyncData(() => dashboardService.getRenewableKPIs(), [], renewableKPIs)
  const { data: solarGrowth } = useAsyncData(() => dashboardService.getSolarGrowth(), [], solarGrowthData)
  const { data: capacityByType } = useAsyncData(() => dashboardService.getCapacityByType(), [], defaultCapacity)
  const { data: batteryData } = useAsyncData(() => dashboardService.getBatteryStorage(), [], batteryStorageData)
  const { data: penetration } = useAsyncData(() => dashboardService.getPenetration(), [], penetrationData)

  const years = solarGrowth?.map((d) => d.year) ?? []
  const filteredSolar = year === 'all' ? solarGrowth : solarGrowth?.filter((d) => String(d.year) === year)

  return (
    <section className="section-padding">
      <div className="container-page space-y-10">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <SafeImage src={PAGE_IMAGES.solarFieldBermuda} alt="" className="aspect-[21/6] w-full object-cover" />
        </div>

        <DashboardFilters year={year} onYearChange={setYear} years={years} />

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

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow">
            <DashboardPanelImage src={PAGE_IMAGES.solar} />
            <div className="card-padding">
              <SectionHeading title="Solar Growth" subtitle="Installed capacity and installations over time" className="mb-4" />
              <SolarChart data={filteredSolar ?? []} />
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow">
            <DashboardPanelImage src={PAGE_IMAGES.registry} />
            <div className="card-padding">
              <SectionHeading title="Capacity by Type" subtitle="Distribution of installed renewable capacity" className="mb-4" />
              <div className="h-72" role="img" aria-label="Capacity by type pie chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={capacityByType || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {capacityByType?.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow">
            <DashboardPanelImage src={PAGE_IMAGES.battery} />
            <div className="card-padding">
              <SectionHeading title="Battery Storage" subtitle="Grid-connected storage capacity" className="mb-4" />
              <EnergyChart data={batteryData || []} dataKey="capacity" label="Capacity (MWh)" xAxisKey="quarter" />
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow">
            <DashboardPanelImage src={PAGE_IMAGES.wind} />
            <div className="card-padding">
              <SectionHeading title="Renewable Penetration" subtitle="Share of total electricity generation" className="mb-4" />
              <EnergyChart data={penetration || []} dataKey="penetration" label="Penetration (%)" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
