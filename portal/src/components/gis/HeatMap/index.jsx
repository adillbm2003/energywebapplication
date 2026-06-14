import { Fragment, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Circle, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../../ui/Button'
import { ROUTES } from '../../../constants/routes'
import { formatNumber } from '../../../utils/format'
import 'leaflet/dist/leaflet.css'

const BERMUDA_CENTER = [32.2948, -64.781]
const DEFAULT_ZOOM = 12

const MAP_STYLES = {
  streets: {
    label: 'Street map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
}

function getMarkerColor(capacity) {
  if (capacity >= 100) return '#0B1F3A'
  if (capacity >= 20) return '#0077B6'
  if (capacity >= 5) return '#33B0E0'
  return '#C9A227'
}

function getHeatRadiusMeters(capacity) {
  if (capacity >= 1000) return 900
  if (capacity >= 100) return 450
  if (capacity >= 20) return 220
  if (capacity >= 5) return 120
  return 70
}

function getMarkerRadius(capacity) {
  if (capacity >= 100) return 11
  if (capacity >= 20) return 9
  if (capacity >= 5) return 7
  return 6
}

function ExternalAttributionLinks() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()

    const patchLinks = () => {
      container.querySelectorAll('.leaflet-control-attribution a').forEach((link) => {
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
      })
    }

    patchLinks()
    map.on('attributionadd', patchLinks)

    return () => {
      map.off('attributionadd', patchLinks)
    }
  }, [map])

  return null
}

function FitBounds({ sites }) {
  const map = useMap()

  useEffect(() => {
    if (!sites.length) {
      map.setView(BERMUDA_CENTER, DEFAULT_ZOOM)
      return
    }
    const bounds = L.latLngBounds(sites.map((s) => [s.lat, s.lng]))
    map.fitBounds(bounds.pad(0.18), { maxZoom: 14 })
  }, [sites, map])

  return null
}

function MapLayers({ sites, activeId, onSelect }) {
  return (
    <>
      {sites.map((site) => {
        const color = getMarkerColor(site.capacity)
        const isActive = activeId === site.id

        return (
          <Fragment key={site.id}>
            <Circle
              center={[site.lat, site.lng]}
              radius={getHeatRadiusMeters(site.capacity)}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isActive ? 0.35 : 0.18,
                weight: isActive ? 2 : 1,
                opacity: 0.5,
              }}
            />
            <CircleMarker
              center={[site.lat, site.lng]}
              radius={getMarkerRadius(site.capacity)}
              pathOptions={{
                color: '#ffffff',
                fillColor: color,
                fillOpacity: 1,
                weight: isActive ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelect(isActive ? null : site),
              }}
            />
          </Fragment>
        )
      })}
    </>
  )
}

export default function HeatMap({ installations = [], selectedParish, selectedType }) {
  const [active, setActive] = useState(null)
  const [mapStyle, setMapStyle] = useState('streets')

  const filtered = useMemo(() => {
    return installations.filter((item) => {
      if (selectedParish && selectedParish !== 'all' && item.parish !== selectedParish) return false
      if (selectedType && selectedType !== 'all' && item.type !== selectedType) return false
      return true
    })
  }, [installations, selectedParish, selectedType])

  const stats = useMemo(() => {
    const totalCapacity = filtered.reduce((sum, i) => sum + i.capacity, 0)
    const parishes = new Set(filtered.map((i) => i.parish)).size
    return { count: filtered.length, totalCapacity, parishes }
  }, [filtered])

  const tiles = MAP_STYLES[mapStyle]

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white card-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-navy-900 via-[#1a4068] to-teal-800 px-4 py-3 text-white">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wider text-teal-200">GIS layer</p>
          <p className="text-h4 text-white">Bermuda solar installations</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-white/10 p-0.5 backdrop-blur-sm">
            {Object.entries(MAP_STYLES).map(([key, style]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMapStyle(key)}
                className={`rounded-md px-3 py-1 text-caption font-semibold transition-colors ${
                  mapStyle === key ? 'bg-white text-navy-900' : 'text-white hover:bg-white/10'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-caption font-semibold backdrop-blur-sm">
            {stats.count} sites
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-caption font-semibold backdrop-blur-sm">
            {formatNumber(stats.totalCapacity, { maximumFractionDigits: 1 })} kW
          </span>
        </div>
      </div>

      <div className="relative h-[min(70vh,520px)] min-h-[400px] w-full">
        <MapContainer
          center={BERMUDA_CENTER}
          zoom={DEFAULT_ZOOM}
          className="gis-map h-full w-full"
          scrollWheelZoom
          zoomControl
        >
          <TileLayer attribution={tiles.attribution} url={tiles.url} />
          <ExternalAttributionLinks />
          <FitBounds sites={filtered} />
          <MapLayers sites={filtered} activeId={active?.id} onSelect={setActive} />
        </MapContainer>

        <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-lg bg-navy-900/80 px-3 py-2 text-caption text-white backdrop-blur-sm">
          <span className="font-semibold text-teal-300">{filtered.length}</span> installation{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="border-t border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getMarkerColor(active.capacity) }}
                    aria-hidden="true"
                  />
                  <h3 className="text-h4 text-navy-900">{active.name}</h3>
                </div>
                <p className="mt-1 text-body-small text-slate-600">
                  {active.parish} · {active.type}
                </p>
                <p className="mt-1 text-body-small font-semibold text-teal-700">
                  {formatNumber(active.capacity, { maximumFractionDigits: 1 })} kW installed capacity
                </p>
                <p className="mt-1 text-caption text-slate-500">
                  {active.lat.toFixed(4)}°N, {Math.abs(active.lng).toFixed(4)}°W
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setActive(null)}>
                  Close
                </Button>
                <Button to={ROUTES.registry} variant="primary" size="sm">
                  View registry
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!active && filtered.length > 0 && (
        <p className="border-t border-slate-100 px-4 py-2 text-center text-caption text-slate-500">
          Click a marker on the map for details ·{' '}
          <Link to={ROUTES.registry} className="font-semibold text-teal-600 hover:text-teal-700">
            Open full registry
          </Link>
        </p>
      )}
    </div>
  )
}
