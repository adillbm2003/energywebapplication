import { ROUTES } from '../constants/routes'
import { PAGE_IMAGES } from '../constants/branding'

export const innovationTopics = [
  { title: 'Smart Grids', description: 'Advanced grid management enabling two-way power flows and distributed energy integration.', status: 'Active', image: PAGE_IMAGES.grid, linkTo: ROUTES.renewableDashboard, linkLabel: 'View grid data' },
  { title: 'Battery Energy Storage', description: 'Grid-scale and residential storage for peak shaving and renewable integration.', status: 'Active', image: PAGE_IMAGES.battery, linkTo: ROUTES.renewableDashboard, linkLabel: 'Storage metrics' },
  { title: 'Artificial Intelligence', description: 'AI applications for demand forecasting, grid optimisation, and predictive maintenance.', status: 'Research', image: PAGE_IMAGES.analytics, linkTo: ROUTES.education, linkLabel: 'Learning resources' },
  { title: 'Distributed Energy Resources', description: 'Coordinating rooftop solar, storage, and flexible loads across the grid.', status: 'Active', image: PAGE_IMAGES.solar, linkTo: ROUTES.registry, linkLabel: 'Energy registry' },
  { title: 'Virtual Power Plants', description: 'Aggregating distributed assets to provide grid services.', status: 'Pilot', image: PAGE_IMAGES.energy, linkTo: ROUTES.projects, linkLabel: 'View projects' },
  { title: 'Demand Response', description: 'Technologies enabling consumers to reduce load during peak periods.', status: 'Active', image: PAGE_IMAGES.grid, linkTo: ROUTES.transitionDashboard, linkLabel: 'Transition dashboard' },
  { title: 'Digital Twins', description: 'Virtual models of energy infrastructure for planning and operations.', status: 'Research', image: PAGE_IMAGES.innovation, linkTo: ROUTES.gis, linkLabel: 'GIS platform' },
  { title: 'Advanced Energy Analytics', description: 'Data-driven insights for policy, planning, and operational decisions.', status: 'Active', image: PAGE_IMAGES.analytics, linkTo: ROUTES.renewableDashboard, linkLabel: 'Explore dashboards' },
  { title: 'Blockchain & Energy Systems', description: 'Exploring distributed ledger applications for energy trading and grid management.', status: 'Research', image: PAGE_IMAGES.blockchain, linkTo: ROUTES.contact, linkLabel: 'Partner with us' },
]

export const digitalCurrencyPlaceholder = {
  title: 'Digital Currency & Energy',
  status: 'Coming Soon',
  image: PAGE_IMAGES.innovation,
  description:
    'This section will provide public awareness information on vendors and service providers that accept digital currency, as part of Bermuda\'s emerging technology landscape. This content is for informational purposes only and does not constitute financial advice.',
  note: 'Content is being developed with industry partners and will be published when ready.',
}
