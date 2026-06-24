import { PAGE_IMAGES } from '../constants/branding'

const CATEGORY_IMAGES = {
  Policy: PAGE_IMAGES.government,
  Legislation: PAGE_IMAGES.government,
  Regulation: PAGE_IMAGES.grid,
  Publication: PAGE_IMAGES.consultation,
  Strategy: PAGE_IMAGES.innovation,
  Consultation: PAGE_IMAGES.consultation,
  Guidance: PAGE_IMAGES.analytics,
}

const TAG_IMAGES = [
  ['charging', PAGE_IMAGES.electricBus],
  ['satellite', PAGE_IMAGES.satellite],
  ['space', PAGE_IMAGES.spaceSatellites],
  ['telecommunications', PAGE_IMAGES.telecom],
  ['broadcasting', PAGE_IMAGES.telecom],
  ['hydrogen', PAGE_IMAGES.windTurbine],
  ['efficiency', PAGE_IMAGES.balconySolar],
  ['solar', PAGE_IMAGES.solarFieldBermuda],
  ['renewable', PAGE_IMAGES.govSolarField],
  ['EV', PAGE_IMAGES.electricBuses],
  ['fuels', PAGE_IMAGES.hamiltonStreet],
]

export function policyImage({ category, tags = [], sector }) {
  if (sector === 'Space and Satellite') return PAGE_IMAGES.spaceSatellites
  if (sector === 'Telecommunications') return PAGE_IMAGES.telecom
  if (sector === 'Renewable Energy') return PAGE_IMAGES.solarFieldBermuda
  if (sector === 'Fuels') return PAGE_IMAGES.hamiltonStreet

  for (const [tag, image] of TAG_IMAGES) {
    if (tags.includes(tag)) return image
  }

  return CATEGORY_IMAGES[category] || PAGE_IMAGES.energy
}
