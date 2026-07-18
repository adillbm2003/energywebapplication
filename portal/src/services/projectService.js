import { projects } from '../data/projects'
import { fetchMockById, fetchFromAPI } from './api'
import { sortByNewest } from '../utils/sortContent'
import { PAGE_IMAGES } from '../constants/branding'

function pickProjectImage(p) {
  if (p.image && !p.image.includes('unsplash.com') && !p.image.includes('solar.jpg') && !p.image.includes('solar-rooftop')) {
    return p.image
  }

  const text = `${p.title || ''} ${p.description || ''} ${p.category || ''}`.toLowerCase()

  if (text.includes('bus') || text.includes('transport') || text.includes('fleet electrif') || text.includes('public transport')) return PAGE_IMAGES.dptElectrification
  if (text.includes('ev charging') || text.includes('electric vehicle infra') || text.includes('charging station') || text.includes('charger')) return PAGE_IMAGES.charging
  if (text.includes('electric vehicle') || text.includes(' ev ') || text.includes('evs ')) return PAGE_IMAGES.ev
  if (text.includes('balcony')) return PAGE_IMAGES.balconySolar
  if (text.includes('bhc') || text.includes('housing corporation') || text.includes('community solar')) return PAGE_IMAGES.bhcHousing
  if (text.includes('efficiency') || text.includes('retrofit') || text.includes('hvac') || text.includes('led lighting')) return PAGE_IMAGES.efficiency
  if (text.includes('wind') || text.includes('turbine')) return PAGE_IMAGES.windTurbine
  if (text.includes('battery') || text.includes('storage')) return PAGE_IMAGES.batteryRooms
  if (text.includes('gis') || text.includes('geospatial') || text.includes('mapping')) return PAGE_IMAGES.gisHeatmap
  if (text.includes('space') || text.includes('satellite')) return PAGE_IMAGES.spaceSatellites
  if (text.includes('floating')) return PAGE_IMAGES.floatingSolar
  if (text.includes('dockyard') || text.includes('harbour') || text.includes('harbor')) return PAGE_IMAGES.dockyardSolar
  if (text.includes('government') || text.includes('govt') || text.includes('ministry') || text.includes('public sector')) return PAGE_IMAGES.govSolarField
  if (text.includes('rooftop') || text.includes('roof top')) return PAGE_IMAGES.dockyardSolar
  if (text.includes('worker') || text.includes('install') || text.includes('belco')) return PAGE_IMAGES.solarWorkers

  return PAGE_IMAGES.solarFieldBermuda
}

function pickProjectCategory(p) {
  if (p.category) return p.category
  const text = `${p.title || ''} ${p.description || ''}`.toLowerCase()
  if (text.includes('transport') || text.includes('bus') || text.includes('fleet') || text.includes('ev') || text.includes('electric vehicle')) return 'Transport'
  if (text.includes('efficiency') || text.includes('retrofit') || text.includes('hvac') || text.includes('led')) return 'Efficiency'
  if (text.includes('battery') || text.includes('storage')) return 'Storage'
  if (text.includes('space') || text.includes('satellite')) return 'Space'
  if (text.includes('community') || text.includes('bhc') || text.includes('housing')) return 'Community Solar'
  return 'Solar'
}

export const projectService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/projects', projects);
    return sortByNewest(items.map(p => {
      const years = (p.timeline || '').split('-');
      const startDate = years[0] ? `${years[0].trim()}-01-01` : '2026-01-01';
      const expectedCompletion = years[1] ? `${years[1].trim()}-12-31` : '2028-12-31';
      return {
        id: p.id,
        title: p.title,
        category: pickProjectCategory(p),
        status: p.status,
        summary: p.description || p.summary,
        location: p.location || 'Island-wide',
        startDate,
        expectedCompletion,
        progress: p.progress ?? (p.status === 'Completed' ? 100 : p.status === 'Planning' ? 10 : 45),
        budget: p.budget || '$5.0M',
        image: pickProjectImage(p),
        milestones: p.milestones || [
          { title: 'Project commenced', date: startDate, completed: true },
          { title: 'Project conclusion', date: expectedCompletion, completed: p.status === 'Completed' }
        ],
        documents: p.documents || [],
        gallery: p.gallery || []
      };
    }), ['startDate']);
  },
  getById: async (id) => {
    const all = await projectService.getAll();
    const item = all.find(p => String(p.id) === String(id));
    if (!item) throw new Error("Project not found");
    return item;
  },
  getFeatured: async () => {
    const all = await projectService.getAll();
    return all.filter((p) => p.progress < 100).slice(0, 3);
  },
}
