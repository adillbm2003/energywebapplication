import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../../ui/Button'
import { ROUTES } from '../../../constants/routes'
import { formatNumber } from '../../../utils/format'
import 'leaflet/dist/leaflet.css'

const BERMUDA_CENTER = [32.2948, -64.781]
const DEFAULT_ZOOM = 12

// Basemaps are decoration: they change what the island looks like, never where
// a marker sits. A marker's position comes from the latitude/longitude in the
// Planning export, so a permit recorded at the wrong coordinate is wrong on
// every basemap. Switching provider was raised as a fix for misplaced pins and
// is not one.
//
// Both layers come from Esri, which serves these basemaps without an API key.
//
// This was CARTO Voyager until CARTO put their basemaps behind a key: the tiles
// kept returning HTTP 200, so nothing errored, but every one of them was a grey
// placeholder stamped "API KEY REQUIRED" and the public map was unreadable.
// Raw OpenStreetMap tiles are not the fallback either -- their volunteer servers
// block this kind of production use outright and return a 403 "Access blocked"
// image. Esri's World Street Map is keyless, carries Bermuda's parish and road
// labels, and is already the source of the satellite layer below, so the map now
// depends on one provider instead of two.
//
// If these tiles ever start rendering as placeholders again, check the tile URL
// in the browser's network tab before touching anything else: a watermarked tile
// is a 200, so it will not show up as a failure anywhere.
//
// maxZoom matters here: Leaflet stops zooming at the layer's limit, and at 18
// it was impossible to zoom in far enough to separate neighbouring rooftops.
const MAP_STYLES = {
  streets: {
    label: 'Street map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution:
      'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, USGS',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
  },
}

// Utility scale starts at 500 kW. The legend previously drew the top band at
// 100 kW while getEffectiveType() classified Utility above 500, so a 200 kW
// commercial rooftop was shown in the Utility colour but labelled Commercial.
// One threshold now drives the type, the colour and the key.
const UTILITY_MIN_KW = 500

// A permit whose capacity was never recorded is `null`, not 0. The Planning
// export stores a large minority of capacities as text, which Excel omits from
// its totals; the Department publishes that Excel figure, so those permits carry
// no capacity here. They are still real installations and still appear on the
// map — they just cannot be sized or banded by a number nobody recorded, so they
// get their own neutral treatment rather than being lumped in with the smallest
// systems. `null >= 5` is false in JS, so an unguarded comparison would have
// silently coloured all 173 as sub-5 kW residential.
const UNRECORDED_COLOR = '#94A3B8'

// Road name only, for the map hover: "82 North Shore Road" reads as "North Shore
// Road". Street level is also the honest precision here -- the coordinates in
// the Planning export are geocoded to a street or area, not to the building, so
// printing a house number claims a precision the position does not have. The
// registry table still carries the full address for identification.
function streetOnly(name) {
  if (!name) return ''
  const stripped = String(name)
    .replace(/^\s*\d+[A-Za-z]?\s+/, '')
    .replace(/\s+Unit:?\s*\S+$/i, '')
    .trim()
  return stripped || String(name)
}

// Some permits reach the export with no address at all. The importer used to
// name those "Permit <row number>", which is meaningless to a reader and moves
// if the sheet is ever re-sorted. They are real installations -- B0276-23 is a
// live 12.54 kW system -- so they stay on the map and in the totals, but are
// labelled by the one thing actually known about their location: the parish.
//
// Keyed off the missing address rather than the "Permit N" string, so a real
// road that happens to start with "Permit" is never caught by accident. The
// endpoint COALESCEs address to name, so an address equal to the name means the
// address column was empty.
function displayName(site) {
  const addr = String(site.address || '').trim()
  const name = String(site.name || '').trim()
  if (!addr || addr === name) {
    if (/^Permit\s+\d+$/i.test(name) || !name) {
      return site.parish ? `${site.parish} — address not recorded` : 'Address not recorded'
    }
  }
  return streetOnly(name)
}

function hasCapacity(capacity) {
  return typeof capacity === 'number' && Number.isFinite(capacity) && capacity > 0
}

function getEffectiveType(item) {
  if (!hasCapacity(item.capacity)) return item.type
  return item.capacity >= UTILITY_MIN_KW ? 'Utility' : item.type
}

function getMarkerColor(capacity) {
  if (!hasCapacity(capacity)) return UNRECORDED_COLOR
  if (capacity >= UTILITY_MIN_KW) return '#0B1F3A'
  if (capacity >= 20) return '#0077B6'
  if (capacity >= 5) return '#33B0E0'
  return '#C9A227'
}

function getHeatRadiusMeters(capacity) {
  if (!hasCapacity(capacity)) return 70
  if (capacity >= 1000) return 900
  if (capacity >= UTILITY_MIN_KW) return 450
  if (capacity >= 20) return 220
  if (capacity >= 5) return 120
  return 70
}

function getMarkerRadius(capacity) {
  if (!hasCapacity(capacity)) return 6
  if (capacity >= UTILITY_MIN_KW) return 11
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

// The halo and the dot are drawn in two separate passes, not interleaved per
// site, because Leaflet paints paths in insertion order within one pane. Drawn
// site-by-site, a later site's halo landed on top of every dot already drawn —
// and a halo is sized in metres from capacity, so the 6 MW airport array covered
// a large part of the island. Dots underneath it could not be hovered or
// clicked, which read as "many installations have no details".
//
// `interactive: false` is the other half: a Leaflet path captures pointer events
// by default, so even a correctly stacked halo would still swallow hovers meant
// for the dot beneath it. The halo is decoration and should never be a target.
function MapLayers({ sites, activeId, onSelect }) {
  return (
    <>
      {sites.map((site) => {
        const color = getMarkerColor(site.capacity)
        const isActive = activeId === site.id
        return (
          <Circle
            key={`halo-${site.id}`}
            center={[site.lat, site.lng]}
            radius={getHeatRadiusMeters(site.capacity)}
            interactive={false}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: isActive ? 0.35 : 0.18,
              weight: isActive ? 2 : 1,
              opacity: 0.5,
            }}
          />
        )
      })}

      {sites.map((site) => {
        const color = getMarkerColor(site.capacity)
        const isActive = activeId === site.id
        return (
          <CircleMarker
            key={`dot-${site.id}`}
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
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={1}>
              <span className="text-xs font-semibold">{displayName(site)}</span>
              <br />
              <span className="text-xs text-slate-600">
                {hasCapacity(site.capacity)
                  ? `${formatNumber(site.capacity, { maximumFractionDigits: 1 })} kW`
                  : 'Capacity not recorded'}
              </span>
            </Tooltip>
          </CircleMarker>
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
      if (selectedType && selectedType !== 'all' && getEffectiveType(item) !== selectedType) return false
      return true
    })
  }, [installations, selectedParish, selectedType])

  const stats = useMemo(() => {
    // `|| 0` because an unrecorded capacity is null; the total is the sum of the
    // figures actually recorded, which is the basis the Department publishes.
    const totalCapacity = filtered.reduce((sum, i) => sum + (i.capacity || 0), 0)
    const parishes = new Set(filtered.map((i) => i.parish)).size
    return { count: filtered.length, totalCapacity, parishes }
  }, [filtered])

  const tiles = MAP_STYLES[mapStyle]

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white card-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-navy-900 via-[#1a4068] to-teal-800 px-4 py-3 text-white">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wider text-teal-200">GIS layer</p>
          <p className="text-h4 text-white">Bermuda solar PV applications</p>
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
          <TileLayer
            key={mapStyle}
            attribution={tiles.attribution}
            url={tiles.url}
            subdomains={tiles.subdomains}
            maxZoom={tiles.maxZoom}
          />
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
                  <h3 className="text-h4 text-navy-900">{displayName(active)}</h3>
                </div>
                <p className="mt-1 text-body-small text-slate-600">
                  {active.parish} · {getEffectiveType(active)}
                </p>
                <p className={`mt-1 text-body-small font-semibold ${hasCapacity(active.capacity) ? 'text-teal-700' : 'text-slate-500'}`}>
                  {hasCapacity(active.capacity)
                    ? `${formatNumber(active.capacity, { maximumFractionDigits: 1 })} kW installed capacity`
                    : 'Installed capacity not recorded'}
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
