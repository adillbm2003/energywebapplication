import { PAGE_IMAGES } from '../constants/branding'

export const homeStats = [
  { label: 'Installed Solar Capacity', value: '15.6', unit: 'MW', change: '+9%', trend: 'up' },
  { label: 'Renewable Penetration', value: '8.4', unit: '%', change: '+1.2%', trend: 'up' },
  { label: 'Registered EVs', value: '842', unit: '', change: '+28%', trend: 'up' },
  { label: 'Solar Installations', value: '720', unit: '', change: '+12%', trend: 'up' },
]

export const renewableKPIs = [
  { label: 'Installed Capacity', value: 15.6, unit: 'MW', change: 9.0, image: PAGE_IMAGES.solarFieldBermuda },
  { label: 'Solar Installations', value: 720, unit: 'Systems', change: 12.0, image: PAGE_IMAGES.dockyardSolar },
  { label: 'Battery Storage', value: 3.2, unit: 'MWh', change: 45.0, image: PAGE_IMAGES.battery },
  { label: 'Renewable Penetration', value: 8.4, unit: '%', change: 1.2, image: PAGE_IMAGES.windTurbine },
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

export const batteryStorageData = [
  { quarter: 'Q1 2025', capacity: 1.2 },
  { quarter: 'Q2 2025', capacity: 1.8 },
  { quarter: 'Q3 2025', capacity: 2.4 },
  { quarter: 'Q4 2025', capacity: 2.8 },
  { quarter: 'Q1 2026', capacity: 3.2 },
]

export const penetrationData = [
  { year: '2020', penetration: 4.2 },
  { year: '2021', penetration: 5.8 },
  { year: '2022', penetration: 7.1 },
  { year: '2023', penetration: 9.0 },
  { year: '2024', penetration: 10.5 },
  { year: '2025', penetration: 11.6 },
  { year: '2026', penetration: 12.8 },
]

export const transitionKPIs = [
  { label: 'Registered EVs', value: 842, unit: '', change: 28.0, image: PAGE_IMAGES.electricBuses },
  { label: 'Public Chargers', value: 48, unit: '', change: 26.3, image: PAGE_IMAGES.electricBus },
  { label: 'EV Market Share', value: 4.1, unit: '%', change: 1.2, image: PAGE_IMAGES.evExpo },
  { label: 'Fleet Electrification', value: 18, unit: '%', change: 6.0, image: PAGE_IMAGES.electricBuses },
]

export const evAdoptionData = [
  { year: '2020', evs: 140, hybrids: 420 },
  { year: '2021', evs: 210, hybrids: 510 },
  { year: '2022', evs: 320, hybrids: 590 },
  { year: '2023', evs: 470, hybrids: 650 },
  { year: '2024', evs: 620, hybrids: 710 },
  { year: '2025', evs: 740, hybrids: 760 },
  { year: '2026', evs: 842, hybrids: 800 },
]

export const evByCategory = [
  { category: 'Passenger Cars', count: 648, percent: 77, image: PAGE_IMAGES.electricBuses },
  { category: 'Commercial Vans', count: 126, percent: 15, image: PAGE_IMAGES.evExpo },
  { category: 'Motorcycles', count: 42, percent: 5, image: PAGE_IMAGES.electricBus },
  { category: 'Buses & Fleet', count: 26, percent: 3, image: PAGE_IMAGES.electricBuses },
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

export const publicTransportElectrification = [
  { year: '2023', electric: 2, hybrid: 8, diesel: 42 },
  { year: '2024', electric: 5, hybrid: 12, diesel: 38 },
  { year: '2025', electric: 10, hybrid: 15, diesel: 32 },
  { year: '2026', electric: 14, hybrid: 18, diesel: 28 },
]

export const energyEfficiencyMetrics = [
  { metric: 'Govt. Building Energy Use', baseline: 100, current: 78, target: 65 },
  { metric: 'Street Lighting Efficiency', baseline: 100, current: 85, target: 70 },
  { metric: 'Residential Efficiency Index', baseline: 100, current: 88, target: 75 },
]
