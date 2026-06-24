import { ROUTES } from './routes'

export const MAIN_NAV = [
  { label: 'Home', to: ROUTES.home },
  { label: 'About', to: ROUTES.about },
  {
    label: 'Sector',
    to: ROUTES.energy,
    children: [
      { label: 'Registered Solar Installers', to: ROUTES.installers },
      { label: 'Vehicles', to: ROUTES.vehicles },
      { label: 'Electronic Communications', to: ROUTES.electronicCommunications },
      { label: 'Broadcasting', to: ROUTES.broadcasting },
      { label: 'Space & Satellite', to: ROUTES.spaceSatellite },
    ],
  },
  {
    label: 'Policy',
    overviewLabel: 'Policies & Publications',
    to: ROUTES.policies,
    children: [
      { label: 'Consultations', to: ROUTES.consultations },
    ],
  },
  {
    label: 'Data & GIS',
    to: ROUTES.dashboard,
    children: [
      { label: 'Renewable Dashboard', to: ROUTES.renewableDashboard },
      { label: 'Energy Transition Dashboard', to: ROUTES.transitionDashboard },
      { label: 'Renewable Energy Registry', to: ROUTES.registry },
      { label: 'GIS Heat Map', to: ROUTES.gis },
      { label: 'Energy Simulator', href: 'https://simulator.energy.bm/' },
    ],
  },
  {
    label: 'Programmes',
    to: ROUTES.projects,
    children: [
      { label: 'Energy Projects', to: ROUTES.projects },
      { label: 'Education Centre', to: ROUTES.education },
      { label: 'Bursary Programme', to: ROUTES.bursary },
      { label: 'Innovation', to: ROUTES.innovation },
    ],
  },
  { label: 'News', to: ROUTES.news },
  { label: 'Contact', to: ROUTES.contact },
]

export const FOOTER_LINKS = {
  department: [
    { label: 'About the Department', to: ROUTES.about },
    { label: 'Energy', to: ROUTES.energy },
    { label: 'Registered Installers', to: ROUTES.installers },
    { label: 'Contact Us', to: ROUTES.contact },
  ],
  policy: [
    { label: 'Policies & Publications', to: ROUTES.policies },
    { label: 'Consultations', to: ROUTES.consultations },
  ],
  resources: [
    { label: 'Renewable Dashboard', to: ROUTES.renewableDashboard },
    { label: 'Energy Registry', to: ROUTES.registry },
    { label: 'GIS Heat Map', to: ROUTES.gis },
    { label: 'Education Centre', to: ROUTES.education },
    { label: 'Energy Bursary', to: ROUTES.bursary },
  ],
  legal: [
    { label: 'Privacy Policy', to: ROUTES.privacy },
    { label: 'Terms of Use', to: ROUTES.terms },
    { label: 'Accessibility', to: ROUTES.accessibility },
    { label: 'Cookie Policy', to: ROUTES.cookies },
  ],
}

export const SPACE_NAV = [
  { label: 'Overview', to: ROUTES.spaceSatellite, slug: '' },
  { label: 'Bermuda & Global Space Economy', to: `${ROUTES.spaceSatellite}/bermuda-global-space-economy`, slug: 'bermuda-global-space-economy' },
  { label: 'Why Choose Bermuda', to: `${ROUTES.spaceSatellite}/why-choose-bermuda`, slug: 'why-choose-bermuda' },
  { label: 'Earth Stations & Operations', to: `${ROUTES.spaceSatellite}/earth-stations-operations`, slug: 'earth-stations-operations' },
  { label: 'Satellite Filing & Guidance', to: `${ROUTES.spaceSatellite}/satellite-filing-guidance`, slug: 'satellite-filing-guidance' },
  { label: 'Space Insurance', to: `${ROUTES.spaceSatellite}/space-insurance`, slug: 'space-insurance' },
  { label: 'National Space Strategy', to: `${ROUTES.spaceSatellite}/national-space-strategy`, slug: 'national-space-strategy' },
  { label: 'Sector Enquiries', to: `${ROUTES.spaceSatellite}/sector-enquiries`, slug: 'sector-enquiries' },
]
