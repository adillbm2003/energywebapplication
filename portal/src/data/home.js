import { ROUTES } from '../constants/routes'
import { PAGE_IMAGES } from '../constants/branding'

export const homePriorities = [
  {
    title: 'Accelerate Renewable Energy',
    description:
      'Track installed solar capacity, battery storage, and renewable penetration across Bermuda through live dashboards and the national registry.',
    image: PAGE_IMAGES.solarFieldBermuda,
    to: ROUTES.renewableDashboard,
    cta: 'View Renewable Dashboard',
  },
  {
    title: 'Shape Energy Policy',
    description:
      "Access legislation, publications, and open consultations. Your feedback helps guide Bermuda's clean energy transition.",
    image: PAGE_IMAGES.consultation,
    to: ROUTES.consultations,
    cta: 'Join a Consultation',
  },
  {
    title: 'Plan Your Clean Energy Future',
    description:
      'Use the energy simulator to estimate savings from solar, storage, and EVs. Find registered installers and educational guides.',
    image: PAGE_IMAGES.hamiltonStreet,
    href: 'https://simulator.energy.bm/',
    cta: 'Try the Simulator',
  },
]

export const homeSpotlights = [
  {
    title: 'BHC Community Solar',
    description: 'Shared renewable generation for Bermuda Housing Corporation residents and eligible subscribers island-wide.',
    image: PAGE_IMAGES.bhcHousing,
    to: ROUTES.projectDetail('prj-bhc-solar'),
    tag: 'Featured Project',
  },
  {
    title: 'GIS Renewable Heat Map',
    description: 'Explore solar installation locations across Bermuda on an interactive island map.',
    image: PAGE_IMAGES.gisHeatmap,
    to: ROUTES.gis,
    tag: 'Data & GIS',
  },
  {
    title: 'Space & Satellite Sector',
    description: "Bermuda's premier jurisdiction for satellite filing, earth stations, and space insurance.",
    image: PAGE_IMAGES.spaceSatellites,
    to: ROUTES.spaceSatellite,
    tag: 'Space Economy',
  },
  {
    title: 'Energy Bursary Programme',
    description: 'Supporting Bermudian students pursuing careers in energy, sustainability, and space STEM.',
    image: PAGE_IMAGES.educationOutreach,
    to: ROUTES.bursary,
    tag: 'Programmes',
  },
]

export const homeQuickAccess = [
  { label: 'GIS Heat Map', to: ROUTES.gis, image: PAGE_IMAGES.gisHeatmap },
  { label: 'Public Sector Fleet', to: ROUTES.projectDetail('prj-dpt-electrification'), image: PAGE_IMAGES.bus },
  { label: 'Balcony Solar Pilot', to: ROUTES.projectDetail('prj-balcony-solar'), image: PAGE_IMAGES.balconySolar },
  { label: 'EV Adoption', to: ROUTES.transitionDashboard, image: PAGE_IMAGES.ev },
  { label: 'Renewable Capacity', to: ROUTES.renewableDashboard, image: PAGE_IMAGES.solarFieldBermuda },
  { label: 'Solar Installers', to: ROUTES.installers, image: PAGE_IMAGES.solarWorkers },
  { label: 'Policies', to: ROUTES.policies, image: PAGE_IMAGES.hamiltonStreet },
  { label: 'Education Centre', to: ROUTES.education, image: PAGE_IMAGES.educationOutreach },
]
