import { useMemo, useState } from 'react'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import HeatMap from '../../components/gis/HeatMap'
import MapLegend from '../../components/gis/MapLegend'
import MapFilters from '../../components/gis/MapFilters'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { gisService } from '../../services'
import { gisInstallations } from '../../data/installers'
import { ROUTES } from '../../constants/routes'
import { formatNumber } from '../../utils/format'

const defaultParishes = [...new Set(gisInstallations.map(i => i.parish))].sort()
const defaultTypes = [...new Set(gisInstallations.map(i => i.type))].filter(Boolean).sort()

export default function GIS() {
  useDocumentTitle('GIS Heat Map')

  const [parish, setParish] = useState('all')
  const [type, setType] = useState('all')

  const { data: installations } = useAsyncData(() => gisService.getInstallations(), [], gisInstallations)
  const { data: parishes } = useAsyncData(() => gisService.getParishes(), [], defaultParishes)
  const { data: types } = useAsyncData(() => gisService.getTypes(), [], defaultTypes)

  const summary = useMemo(() => {
    const list = installations ?? []
    return {
      sites: list.length,
      capacity: list.reduce((sum, i) => sum + i.capacity, 0),
      parishes: new Set(list.map((i) => i.parish)).size,
    }
  }, [installations])

  return (
    <>
      <PageBanner
        title="Bermuda Renewable Energy Heat Map"
        subtitle="Solar PV permit applications from Department of Planning records (2019–present)"
        breadcrumbs={[
          { label: 'Data & GIS', to: ROUTES.dashboard },
          { label: 'GIS Heat Map', to: ROUTES.gis },
        ]}
        image={PAGE_IMAGES.gisHeatmap}
      />

      <section className="section-padding">
        <div className="container-page space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white card-padding card-shadow text-center">
              <p className="text-caption text-slate-500">Registered sites</p>
              <p className="text-h2 font-bold text-navy-900">{summary.sites}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white card-padding card-shadow text-center">
              <p className="text-caption text-slate-500">Total capacity</p>
              <p className="text-h2 font-bold text-teal-700">{formatNumber(summary.capacity, { maximumFractionDigits: 0 })} <span className="text-h4 font-semibold text-slate-500">kW</span></p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white card-padding card-shadow text-center">
              <p className="text-caption text-slate-500">Parishes covered</p>
              <p className="text-h2 font-bold text-navy-900">{summary.parishes}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-3 space-y-4">
              <MapFilters
                parishes={parishes ?? []}
                types={types ?? []}
                parish={parish}
                type={type}
                onParishChange={setParish}
                onTypeChange={setType}
              />
              <HeatMap
                installations={installations ?? []}
                selectedParish={parish}
                selectedType={type}
              />
            </div>
            <div className="space-y-4">
              <MapLegend />
              <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white card-padding">
                <p className="text-body-small font-semibold text-navy-900">Explore the data</p>
                <p className="mt-1 text-caption text-slate-600">
                  View full installation records, filter by parish, and export registry data.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Button to={ROUTES.registry} variant="primary" size="sm">Energy Registry</Button>
                  <Button to={ROUTES.renewableDashboard} variant="outline" size="sm">Renewable Dashboard</Button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-caption text-slate-500">
            Installation locations are approximate, based on Department of Planning spreadsheet data.
            Future phases will add battery storage, EV charging, and additional GIS layers.
          </p>
        </div>
      </section>
    </>
  )
}
