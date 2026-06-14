import govLogo from '../assets/images/brand/gov-bermuda-logo.jpg'

const base = import.meta.env.BASE_URL || '/';

export const BRANDING = {
  logo: govLogo,
  logoPublic: base + 'gov-bermuda-logo.jpg',
  logoAlt: 'Government of Bermuda — Department of Energy',
  departmentName: 'Department of Energy',
  governmentName: 'Government of Bermuda',
  domain: 'energy.bm',
  phone: '+1 (441) 295-5000',
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
  government: base + 'images/government.jpg',
  space: base + 'images/space.jpg',
  education: base + 'images/education.jpg',
  ev: base + 'images/ev.jpg',
  consultation: base + 'images/consultation.jpg',
  home: base + 'images/home.jpg',
  simulator: base + 'images/home.jpg',
  battery: base + 'images/battery.jpg',
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
  charging: base + 'images/charging.jpg',
  transport: base + 'images/transport.jpg',
  contact: base + 'images/bermuda.jpg',
  policy: base + 'images/consultation.jpg',
  portrait: base + 'images/portrait.jpg',
}

export const IMAGE_FALLBACK = PAGE_IMAGES.solar
