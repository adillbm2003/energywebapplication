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
    title: 'GIS Solar PV Map',
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

// Quick Access exists to reach pages the rest of the home page does not already
// link to. Four tiles were removed because they repeated a destination reached
// higher up the same page -- GIS Solar PV Map and Renewable Capacity from the
// Data, Dashboards & GIS block, EV Adoption from that block and the roadmap, and
// Solar Installers from the installers section directly above. Policies and
// Education Centre are reachable from nowhere else on the page, which is exactly
// why this section is worth keeping.
export const homeQuickAccess = [
  { label: 'Policies', to: ROUTES.policies, image: PAGE_IMAGES.hamiltonStreet },
  { label: 'Education Centre', to: ROUTES.education, image: PAGE_IMAGES.educationOutreach },
  { label: 'Public Sector Fleet', to: ROUTES.projectDetail('prj-dpt-electrification'), image: PAGE_IMAGES.bus },
  { label: 'Balcony Solar Pilot', to: ROUTES.projectDetail('prj-balcony-solar'), image: PAGE_IMAGES.balconySolar },
]
