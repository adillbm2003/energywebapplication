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
  ['charging', PAGE_IMAGES.charging],
  ['satellite', PAGE_IMAGES.space],
  ['space', PAGE_IMAGES.space],
  ['telecommunications', PAGE_IMAGES.telecom],
  ['broadcasting', PAGE_IMAGES.telecom],
  ['hydrogen', PAGE_IMAGES.grid],
  ['efficiency', PAGE_IMAGES.efficiency],
  ['solar', PAGE_IMAGES.solar],
  ['renewable', PAGE_IMAGES.solar],
  ['EV', PAGE_IMAGES.ev],
  ['fuels', PAGE_IMAGES.grid],
]

export function policyImage({ category, tags = [], sector }) {
  if (sector === 'Space and Satellite') return PAGE_IMAGES.space
  if (sector === 'Telecommunications') return PAGE_IMAGES.telecom
  if (sector === 'Renewable Energy') return PAGE_IMAGES.solar
  if (sector === 'Fuels') return PAGE_IMAGES.grid

  for (const [tag, image] of TAG_IMAGES) {
    if (tags.includes(tag)) return image
  }

  return CATEGORY_IMAGES[category] || PAGE_IMAGES.energy
}
