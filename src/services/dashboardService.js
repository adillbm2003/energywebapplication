import {
  homeStats,
  renewableKPIs,
  solarGrowthData,
  capacityByType,
  batteryStorageData,
  penetrationData,
  transitionKPIs,
  evAdoptionData,
  evByCategory,
  chargingInfrastructure,
  publicTransportElectrification,
  energyEfficiencyMetrics,
} from '../data/dashboard'
import { fetchFromAPI, fetchMock } from './api'

// Map flat KPI rows from the DB into the shape the dashboard expects
function mapKpis(rows, fallback) {
  if (!rows || rows.length === 0) return fallback
  // DB rows: { id, name, value, unit, lastUpdated }
  // Dashboard shape: { label, value, unit, change, image }
  return rows.map((row, i) => ({
    label: row.name || row.label,
    value: row.value,
    unit: row.unit || '',
    change: row.change ?? fallback[i]?.change ?? null,
    image: row.image || fallback[i]?.image || null,
  }))
}

export const dashboardService = {
  getHomeStats: () => fetchMock(homeStats),

  getRenewableKPIs: async () => {
    const rows = await fetchFromAPI('/api/kpis', [])
    if (rows.length === 0) return fetchMock(renewableKPIs)
    return mapKpis(rows, renewableKPIs)
  },

  getSolarGrowth: async () => {
    const rows = await fetchFromAPI('/api/statistics/solar', [])
    if (rows.length === 0) return fetchMock(solarGrowthData)
    // Convert statistics_history rows to chart format { year, capacity }
    return rows.map(r => ({ year: r.period, capacity: Number(r.value) }))
  },

  getCapacityByType: () => fetchMock(capacityByType),
  getBatteryStorage: () => fetchMock(batteryStorageData),
  getPenetration: () => fetchMock(penetrationData),

  getTransitionKPIs: () => fetchMock(transitionKPIs),

  getEVAdoption: async () => {
    const rows = await fetchFromAPI('/api/statistics/ev', [])
    if (rows.length === 0) return fetchMock(evAdoptionData)
    return rows.map(r => ({ year: r.period, evs: Number(r.value) }))
  },

  getEVByCategory: () => fetchMock(evByCategory),
  getChargingInfrastructure: () => fetchMock(chargingInfrastructure),
  getPublicTransport: () => fetchMock(publicTransportElectrification),
  getEfficiencyMetrics: () => fetchMock(energyEfficiencyMetrics),
}
