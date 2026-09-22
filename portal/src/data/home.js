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

// One "Explore" grid, replacing the separate Spotlight and Quick Access sections.
// They were two navigation grids two sections apart, and between them they
// repeated four destinations the page already linked to.
//
// What was dropped and why:
//   GIS Solar PV Map      - the Data, Dashboards & GIS block links it already
//   BHC Community Solar   - a project; Featured Initiatives and View All Projects cover it
//   Public Sector Fleet   - likewise, and it is currently one of the three Featured cards
//   Balcony Solar Pilot   - likewise
//
// Which projects appear under Featured Initiatives is decided by the CMS (first
// three under 100% progress), so hardcoding project tiles here duplicated a card
// above whenever the two happened to coincide. Projects are reached through the
// projects section; this grid is for the parts of the Department's work that the
// rest of the page never mentions.
export const homeExplore = [
  {
    title: 'Space & Satellite Sector',
    description: "Bermuda's premier jurisdiction for satellite filing, earth stations, and space insurance.",
    image: PAGE_IMAGES.spaceSatellites,
    to: ROUTES.spaceSatellite,
    tag: 'Space Economy',
  },
  {
    title: 'Policies & Legislation',
    description: 'Acts, policies, consultation documents and guidance notes across energy, telecommunications and space.',
    image: PAGE_IMAGES.hamiltonStreet,
    to: ROUTES.policies,
    tag: 'Policy',
  },
  {
    title: 'Education Centre',
    description: 'Guides, tools and resources to help households and businesses use energy well.',
    image: PAGE_IMAGES.education,
    to: ROUTES.education,
    tag: 'Education',
  },
  {
    title: 'Energy Bursary Programme',
    description: 'Supporting Bermudian students pursuing careers in energy, sustainability, and space STEM.',
    image: PAGE_IMAGES.educationOutreach,
    to: ROUTES.bursary,
    tag: 'Programmes',
  },
]
