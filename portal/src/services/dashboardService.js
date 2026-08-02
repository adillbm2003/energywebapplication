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

let _kpiPromise = null

function fetchKPIs() {
  if (_kpiPromise) return _kpiPromise
  _kpiPromise = fetch('/api/kpis')
    .then(res => { if (!res.ok) throw new Error('API error'); return res.json() })
    .catch(err => { _kpiPromise = null; throw err })
  return _kpiPromise
}

let _solarPromise = null

/** Live totals from the solar permit registry — the same source the GIS page uses. */
function fetchSolarStats() {
  if (_solarPromise) return _solarPromise
  _solarPromise = fetch('/api/solar/stats')
    .then(res => { if (!res.ok) throw new Error('API error'); return res.json() })
    .catch(err => { _solarPromise = null; throw err })
  return _solarPromise
}

export const dashboardService = {
  /**
   * Home page "Key Statistics".
   *
   * Installed capacity and installation count are derived from the solar permit
   * registry rather than the CMS KPI rows, so the home page cannot disagree with
   * the GIS and Registry pages — they previously read 15.6 MW / 720 systems from
   * hand-maintained KPIs while the registry computed 15.4 MW / 659.
   *
   * The remaining figures still come from the CMS, matched by name. They used to
   * be applied by array position, which silently skipped two of the four rows:
   * Renewable Penetration showed a hardcoded 8.4% while the CMS said 12.8%.
   */
  getHomeStats: async () => {
    const stats = JSON.parse(JSON.stringify(homeStats))
    const find = (needle) => stats.find(s => s.label.toLowerCase().includes(needle))

    try {
      const kpis = await fetchKPIs()
      for (const kpi of kpis) {
        const name = String(kpi.name || '').toLowerCase()
        const target = stats.find(s => s.label.toLowerCase() === name)
        if (!target) continue
        const numeric = parseFloat(kpi.value)
        target.value = Number.isFinite(numeric) && numeric >= 1000
          ? numeric.toLocaleString()
          : String(kpi.value)
        if (kpi.unit !== undefined && kpi.unit !== null && kpi.unit !== '') target.unit = kpi.unit
      }
    } catch { /* keep the bundled defaults for anything the CMS cannot supply */ }

    try {
      const solar = await fetchSolarStats()
      const capacity = find('installed solar capacity')
      if (capacity && solar.totalKWExtracted > 0) {
        capacity.value = (solar.totalKWExtracted / 1000).toFixed(1)
        capacity.unit = 'MW'
      }
      const systems = find('solar installations')
      if (systems && solar.total > 0) {
        systems.value = solar.total.toLocaleString()
        systems.unit = ''
      }
    } catch { /* registry unreachable — fall back to the CMS/bundled values */ }

    return stats
  },

  /** Same sourcing rule as getHomeStats, so the two pages always agree. */
  getRenewableKPIs: async () => {
    const kpis = JSON.parse(JSON.stringify(renewableKPIs))
    const find = (needle) => kpis.find(k => k.label.toLowerCase().includes(needle))

    try {
      const cmsKpis = await fetchKPIs()
      for (const row of cmsKpis) {
        const target = kpis.find(k => k.label.toLowerCase() === String(row.name || '').toLowerCase())
        if (!target) continue
        const numeric = parseFloat(row.value)
        if (Number.isFinite(numeric)) target.value = numeric
        if (row.unit) target.unit = row.unit
      }
    } catch { /* keep bundled defaults */ }

    try {
      const solar = await fetchSolarStats()
      const capacity = find('installed capacity')
      if (capacity && solar.totalKWExtracted > 0) {
        capacity.value = parseFloat((solar.totalKWExtracted / 1000).toFixed(1))
        capacity.unit = 'MW'
      }
      const systems = find('solar installations')
      if (systems && solar.total > 0) {
        systems.value = solar.total
        systems.unit = 'Systems'
      }
    } catch { /* registry unreachable */ }

    return kpis
  },

  getSolarGrowth: async () => {
    try {
      const kpis = await fetchKPIs()
      const newSolarGrowth = JSON.parse(JSON.stringify(solarGrowthData))
      const capKpi = kpis.find(k => k.id === 'kpi-1')
      const sysKpi = kpis.find(k => k.id === 'kpi-3')
      if (newSolarGrowth.length > 0) {
        const lastIdx = newSolarGrowth.length - 1
        if (capKpi) newSolarGrowth[lastIdx].capacity = parseFloat(capKpi.value)
        if (sysKpi) newSolarGrowth[lastIdx].installations = parseInt(sysKpi.value)
      }
      return newSolarGrowth
    } catch {
      return solarGrowthData
    }
  },

  getTransitionKPIs: async () => {
    try {
      const kpis = await fetchKPIs()
      const newTransition = JSON.parse(JSON.stringify(transitionKPIs))
      const evKpi = kpis.find(k => k.id === 'kpi-2')
      if (evKpi) newTransition[0].value = parseInt(evKpi.value)
      return newTransition
    } catch {
      return transitionKPIs
    }
  },

  getEVAdoption: async () => {
    try {
      const kpis = await fetchKPIs()
      const newEv = JSON.parse(JSON.stringify(evAdoptionData))
      const evKpi = kpis.find(k => k.id === 'kpi-2')
      if (newEv.length > 0 && evKpi) newEv[newEv.length - 1].evs = parseInt(evKpi.value)
      return newEv
    } catch {
      return evAdoptionData
    }
  },

  getCapacityByType: () => Promise.resolve(capacityByType),
  getBatteryStorage: () => Promise.resolve(batteryStorageData),
  getPenetration: () => Promise.resolve(penetrationData),
  getEVByCategory: () => Promise.resolve(evByCategory),
  getChargingInfrastructure: () => Promise.resolve(chargingInfrastructure),
  getPublicTransport: () => Promise.resolve(publicTransportElectrification),
  getEfficiencyMetrics: () => Promise.resolve(energyEfficiencyMetrics),
}
