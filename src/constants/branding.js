import govLogo from '../assets/images/brand/gov-bermuda-logo.jpg'

export const BRANDING = {
  logo: govLogo,
  logoPublic: '/gov-bermuda-logo.jpg',
  logoAlt: 'Government of Bermuda — Department of Energy',
  departmentName: 'Department of Energy',
  governmentName: 'Government of Bermuda',
  domain: 'energy.bm',
  phone: '+1 (441) 444-0597',
  colors: {
    govBlue: '#2E5496',
    navy: '#0B1F3A',
    teal: '#0077B6',
    gold: '#C9A227',
  },
}

/** Local images in /public/images — each mapped to a relevant subject */
export const PAGE_IMAGES = {
  energy: '/images/energy.jpg',
  solar: '/images/solar.jpg',
  solarRooftop: '/images/solar-rooftop.jpg',
  solarCommercial: '/images/solar-commercial.jpg',
  bermuda: '/images/bermuda.jpg',
  government: '/images/government.jpg',
  space: '/images/space.jpg',
  education: '/images/education.jpg',
  ev: '/images/ev.jpg',
  consultation: '/images/consultation.jpg',
  home: '/images/home.jpg',
  simulator: '/images/home.jpg',
  battery: '/images/battery.jpg',
  van: '/images/van.jpg',
  bus: '/images/bus.jpg',
  motorcycle: '/images/motorcycle.jpg',
  grid: '/images/grid.jpg',
  wind: '/images/wind.jpg',
  innovation: '/images/innovation.jpg',
  bursary: '/images/bursary.jpg',
  registry: '/images/registry.jpg',
  efficiency: '/images/efficiency.jpg',
  analytics: '/images/analytics.jpg',
  blockchain: '/images/blockchain.jpg',
  telecom: '/images/telecom.jpg',
  charging: '/images/charging.jpg',
  transport: '/images/transport.jpg',
  contact: '/images/bermuda.jpg',
  policy: '/images/consultation.jpg',
  portrait: '/images/portrait.jpg',
  transparency: '/images/transparency.jpg',
}

export const IMAGE_FALLBACK = PAGE_IMAGES.solar
