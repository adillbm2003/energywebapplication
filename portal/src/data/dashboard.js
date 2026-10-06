import { PAGE_IMAGES } from '../constants/branding'

// Values here are only the fallback shown before the CMS and the solar registry
// answer; getHomeStats overwrites value and unit from live data.
//
// They used to carry `change` and `trend` as well. Nothing refreshed those, so a
// hardcoded "+9% YoY" stayed put while the capacity above it moved from 15.6 MW
// to 16.8 MW -- a year-on-year figure describing a number that was no longer
// there. `trend` was read by nothing at all. Both are gone; if the Department
// wants real year-on-year movement it has to come from the data, not a literal.
export const homeStats = [
  { label: 'Installed Solar Capacity', value: '15.6', unit: 'MW' },
  { label: 'Renewable Penetration', value: '15', unit: '%' },
  { label: 'Registered EVs', value: '1789', unit: '' },
  { label: 'Solar Installations', value: '720', unit: '' },
]

export const renewableKPIs = [
  { label: 'Installed Capacity', value: 15.6, unit: 'MW', change: 9.0, image: PAGE_IMAGES.solarFieldBermuda },
  { label: 'Solar Installations', value: 720, unit: 'Systems', change: 12.0, image: PAGE_IMAGES.dockyardSolar },
  { label: 'Battery Storage', value: 10, unit: 'MWh', change: 45.0, image: PAGE_IMAGES.batteryRooms },
  // Was PAGE_IMAGES.windTurbine, a photograph of a SailGP event sign with a
  // turbine behind it. Bermuda's renewable share comes from solar, so the tile
  // shows the government solar field.
  { label: 'Renewable Penetration', value: 15, unit: '%', change: 1.2, image: PAGE_IMAGES.govSolarField },
]

export const solarGrowthData = [
  { year: '2020', capacity: 6.1, installations: 310 },
  { year: '2021', capacity: 7.8, installations: 390 },
  { year: '2022', capacity: 9.4, installations: 470 },
  { year: '2023', capacity: 11.2, installations: 560 },
  { year: '2024', capacity: 13.1, installations: 640 },
  { year: '2025', capacity: 14.3, installations: 680 },
  { year: '2026', capacity: 15.6, installations: 720 },
]

export const capacityByType = [
  { name: 'Residential', value: 42, color: '#0077B6' },
  { name: 'Commercial', value: 35, color: '#0B1F3A' },
  { name: 'Utility', value: 18, color: '#C9A227' },
  { name: 'Community', value: 5, color: '#33B0E0' },
]

export const transitionKPIs = [
  { label: 'Registered EVs', value: 1789, unit: '', change: 28.0, image: PAGE_IMAGES.bmw3 },
  { label: 'Public Chargers', value: 48, unit: '', change: 26.3, image: PAGE_IMAGES.charging },
  { label: 'EV Market Share', value: 4.1, unit: '%', change: 1.2, image: PAGE_IMAGES.evExpo },
  { label: 'Fleet Electrification', value: 18, unit: '%', change: 6.0, image: PAGE_IMAGES.dptElectrification },
]

// Fallback only. The live figures come from the vehicle register the backend
// parses at /api/vehicles/fleet; these values mirror it so an outage shows
// something close rather than a different fleet entirely.
export const evByCategory = [
  { category: 'Private Cars', count: 987, percent: 55, image: PAGE_IMAGES.ev },
  { category: 'Rental Mini-Cars', count: 421, percent: 24, image: PAGE_IMAGES.evFleetBermuda },
  { category: 'Motorcycles & Cycles', count: 154, percent: 9, image: PAGE_IMAGES.motorcycle },
  { category: 'Trucks', count: 100, percent: 6, image: PAGE_IMAGES.van },
  { category: 'Buses (Omnibus)', count: 90, percent: 5, image: PAGE_IMAGES.bus },
  { category: 'Government Vehicles', count: 31, percent: 2, image: PAGE_IMAGES.govSolarField },
  { category: 'Taxis & Other', count: 6, percent: 0, image: PAGE_IMAGES.evExpo },
]

export const chargingInfrastructure = [
  { parish: 'Hamilton', level2: 12, fast: 8 },
  { parish: 'Pembroke', level2: 8, fast: 4 },
  { parish: 'Devonshire', level2: 5, fast: 2 },
  { parish: 'Warwick', level2: 6, fast: 3 },
  { parish: 'Southampton', level2: 4, fast: 2 },
  { parish: 'Sandys', level2: 5, fast: 3 },
  { parish: "St. George's", level2: 4, fast: 2 },
]

export const energyEfficiencyMetrics = [
  { metric: 'Govt. Building Energy Use', baseline: 100, current: 78, target: 65 },
  { metric: 'Street Lighting Efficiency', baseline: 100, current: 85, target: 70 },
  { metric: 'Residential Efficiency Index', baseline: 100, current: 88, target: 75 },
]
