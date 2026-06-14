import { PAGE_IMAGES } from '../constants/branding'

export const homeStats = [
  { label: 'Installed Solar Capacity', value: '25.4', unit: 'MW', change: '+18%', trend: 'up' },
  { label: 'Renewable Penetration', value: '12.8', unit: '%', change: '+2.1%', trend: 'up' },
  { label: 'Registered EVs', value: '1,847', unit: '', change: '+34%', trend: 'up' },
  { label: 'Active Consultations', value: '2', unit: '', change: '', trend: 'neutral' },
]

export const renewableKPIs = [
  { label: 'Installed Capacity', value: 25.4, unit: 'MW', change: 18.2, image: PAGE_IMAGES.solar },
  { label: 'Solar Growth (YoY)', value: 22.5, unit: '%', change: 4.3, image: PAGE_IMAGES.solar },
  { label: 'Battery Storage', value: 3.2, unit: 'MWh', change: 45.0, image: PAGE_IMAGES.battery },
  { label: 'Renewable Penetration', value: 12.8, unit: '%', change: 2.1, image: PAGE_IMAGES.wind },
]

export const solarGrowthData = [
  { year: '2020', capacity: 8.2, installations: 420 },
  { year: '2021', capacity: 11.5, installations: 580 },
  { year: '2022', capacity: 14.8, installations: 720 },
  { year: '2023', capacity: 18.2, installations: 890 },
  { year: '2024', capacity: 21.6, installations: 1050 },
  { year: '2025', capacity: 24.1, installations: 1180 },
  { year: '2026', capacity: 25.4, installations: 1245 },
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
  { label: 'Registered EVs', value: 1847, unit: '', change: 34.2, image: PAGE_IMAGES.ev },
  { label: 'Public Chargers', value: 48, unit: '', change: 26.3, image: PAGE_IMAGES.charging },
  { label: 'EV Market Share', value: 8.2, unit: '%', change: 2.8, image: PAGE_IMAGES.analytics },
  { label: 'Fleet Electrification', value: 22, unit: '%', change: 8.5, image: PAGE_IMAGES.transport },
]

export const evAdoptionData = [
  { year: '2020', evs: 320, hybrids: 890 },
  { year: '2021', evs: 480, hybrids: 1020 },
  { year: '2022', evs: 680, hybrids: 1150 },
  { year: '2023', evs: 920, hybrids: 1280 },
  { year: '2024', evs: 1280, hybrids: 1420 },
  { year: '2025', evs: 1580, hybrids: 1550 },
  { year: '2026', evs: 1847, hybrids: 1680 },
]

export const evByCategory = [
  { category: 'Passenger Cars', count: 1420, percent: 77, image: PAGE_IMAGES.ev },
  { category: 'Commercial Vans', count: 285, percent: 15, image: PAGE_IMAGES.van },
  { category: 'Motorcycles', count: 92, percent: 5, image: PAGE_IMAGES.motorcycle },
  { category: 'Buses & Fleet', count: 50, percent: 3, image: PAGE_IMAGES.bus },
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
