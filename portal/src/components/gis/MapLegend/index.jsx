// Bands must match getMarkerColor() in components/gis/HeatMap. Utility scale
// starts at 500 kW, which is also the threshold the importer uses to classify a
// permit as Utility — the key previously said 100 kW and disagreed with both.
const LEGEND_ITEMS = [
  { label: 'Utility (500+ kW)', color: '#0B1F3A', size: 'lg' },
  { label: 'Commercial (20–499 kW)', color: '#0077B6', size: 'md' },
  { label: 'Small Commercial (5–19 kW)', color: '#33B0E0', size: 'sm' },
  { label: 'Residential (<5 kW)', color: '#C9A227', size: 'xs' },
  // There was a fifth grey band here, 'Capacity not recorded', for permits whose
  // capacity the Planning export stores as text. Those permits are no longer
  // drawn on the map, so the key must not advertise a colour that never appears.
  // Restore both together or neither.
]

const sizes = { lg: 'h-4 w-4', md: 'h-3.5 w-3.5', sm: 'h-3 w-3', xs: 'h-2.5 w-2.5' }

export default function MapLegend() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white card-padding card-shadow" role="group" aria-label="Map legend">
      <h3 className="text-body-small font-semibold text-navy-900">Capacity key</h3>
      <p className="mt-0.5 text-caption text-slate-500">Marker colour & glow intensity</p>
      <ul className="mt-3 space-y-2">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-body-small text-slate-600">
            <span className="relative flex items-center justify-center" aria-hidden="true">
              <span
                className={`absolute rounded-full opacity-30 blur-sm ${sizes[item.size]}`}
                style={{ backgroundColor: item.color, transform: 'scale(1.8)' }}
              />
              <span
                className={`relative inline-block rounded-full border border-white shadow-sm ${sizes[item.size]}`}
                style={{ backgroundColor: item.color }}
              />
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
