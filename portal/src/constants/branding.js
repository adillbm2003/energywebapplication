import govLogo from '../assets/images/brand/bermuda-crest-colour.png'

const base = import.meta.env.BASE_URL || '/';

export const BRANDING = {
  // The official Department of Energy lockup: crest plus wordmark, white text on
  // a transparent background (912x216, ~4.2:1). Used in the header and footer,
  // which are both dark navy. Because the wordmark is part of the image, the
  // Logo component must not render the department name again alongside it.
  logo: base + 'dept-of-energy-white.png',
  logoPublic: base + 'dept-of-energy-white.png',
  // Crest on its own, for square contexts where the wide lockup will not fit.
  crest: govLogo,
  logoAlt: 'Government of Bermuda — Department of Energy',
  departmentName: 'Department of Energy',
  governmentName: 'Government of Bermuda',
  domain: 'energy.bm',
  phone: '441-444-0597',
  colors: {
    govBlue: '#2E5496',
    navy: '#0B1F3A',
    teal: '#0077B6',
    gold: '#C9A227',
  },
}

/** Local images in /public/images — each mapped to a relevant subject */
export const PAGE_IMAGES = {
  energy: base + 'images/energy.jpg',
  solar: base + 'images/solar.jpg',
  solarRooftop: base + 'images/solar-rooftop.jpg',
  solarCommercial: base + 'images/solar-commercial.jpg',
  bermuda: base + 'images/bermuda.jpg',
  bermudaVision: base + 'images/bermuda-vision.webp',
  government: base + 'images/government.jpg',
  space: base + 'images/space.jpg',
  education: base + 'images/education.jpg',
  ev: base + 'images/ev.jpg',
  consultation: base + 'images/consultation.jpg',
  // The About page's "Our Mission" photo was a stock image of a North American
  // suburban house -- nothing to do with Bermuda or the Department. It is a
  // placeholder until the Department supplies a photograph, and is replaceable
  // without a deploy from CMS -> Site Images -> About -> "Our Mission" photo.
  home: base + 'images/cabinet-building-hamilton.jpg',
  simulator: base + 'images/home.jpg',
  battery: base + 'images/battery-storage.jpg',
  van: base + 'images/van.jpg',
  bus: base + 'images/bus.jpg',
  motorcycle: base + 'images/motorcycle.jpg',
  grid: base + 'images/grid.jpg',
  wind: base + 'images/wind.jpg',
  innovation: base + 'images/innovation.jpg',
  bursary: base + 'images/bursary.jpg',
  registry: base + 'images/registry.jpg',
  efficiency: base + 'images/efficiency.jpg',
  analytics: base + 'images/analytics.jpg',
  blockchain: base + 'images/blockchain.jpg',
  telecom: base + 'images/telecom.jpg',
  // Broadband Expansion used PAGE_IMAGES.grid, which is a photograph of
  // electricity transmission pylons -- the Energy page's infrastructure image,
  // and the right one there. On a broadband card it showed the wrong utility
  // entirely. It has its own slot now so the two cannot drift back together,
  // and is a placeholder until the Department supplies a photograph.
  broadband: base + 'images/broadband-expansion-2026.jpg',
  charging: base + 'images/charging.jpg',
  transport: base + 'images/transport.jpg',
  contact: base + 'images/bermuda.jpg',
  policy: base + 'images/consultation.jpg',
  spaceOrbit: base + 'images/space-orbit.jpg',
  spaceEarth: base + 'images/space-earth.jpg',
  spaceDish: base + 'images/space-dish.jpg',
  spaceLaunch: base + 'images/space-launch.jpg',
  spaceInsurance: base + 'images/space-insurance-2026.jpg',
  spaceStrategy: base + 'images/space-strategy.jpg',
  spaceAstronaut: base + 'images/space-astronaut.jpg',
  spaceNightsky: base + 'images/space-nightsky.jpg',
  hamiltonStreet: base + 'images/hamilton-street.jpg',
  educationOutreach: base + 'images/education-outreach.jpg',
  electricBus: base + 'images/electric-bus.jpg',
  electricBuses: base + 'images/electric-buses.jpg',
  gisHeatmap: base + 'images/heat-gis.png',
  satellite: base + 'images/satellite.jpg',
  spaceSatellites: base + 'images/space-satellites-2026.jpg',
  solarFieldBermuda: base + 'images/solar-field-bermuda.jpg',
  batteryStorage: base + 'images/battery-storage.jpg',
  dockyardSolar: base + 'images/dockyard-solar.jpg',
  govSolarField: base + 'images/gov-solar-field.jpg',
  bhcHousing: base + 'images/bhc-housing.jpg',
  balconySolar: base + 'images/balcony-solar.jpg',
  floatingSolar: base + 'images/floating-solar.jpg',
  solarWorkers: base + 'images/solar-workers.jpg',
  windTurbine: base + 'images/wind-turbine.jpg',
  evExpo: base + 'images/ev-expo.jpg',
  batteryRooms: base + 'images/battery-rooms.jpg',
  dptElectrification: base + 'images/dpt-electrification.jpg',
  evFleetBermuda: base + 'images/ev-fleet-bermuda.jpg',
  // The two dashboard tiles in Quick Access. They previously shared a single
  // `bermudaEnergyDashboard` key, so replacing one silently replaced both.
  // Separate keys let each be swapped on its own from the CMS.
  renewableDashboard: base + 'images/bermuda-energy-dashboard.png',
  transitionDashboard: base + 'images/bermuda-energy-dashboard.png',
  summerStudentPhoto: base + 'images/summer-student-photo.jpg',
  bmw3: base + 'images/bmw-3.jpg',
  portrait: base + 'images/portrait.jpg',
  portrait1: base + 'images/portraits/774909.jpg',
  portrait2: base + 'images/portraits/91227.jpg',
  portrait3: base + 'images/portraits/1181519.jpg',
  portrait4: base + 'images/portraits/1181686.jpg',
  portrait5: base + 'images/portraits/1222271.jpg',
  portrait6: base + 'images/portraits/2379004.jpg',
}

export const IMAGE_FALLBACK = PAGE_IMAGES.solar
