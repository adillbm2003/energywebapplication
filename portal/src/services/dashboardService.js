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

let _installationsPromise = null

/**
 * Every permit in the solar registry -- the exact rows the GIS map plots.
 *
 * /api/solar/stats gives totals and counts per year, but not capacity per year
 * or per installation type, so the charts need the rows themselves. One cached
 * request serves both.
 */
function fetchSolarInstallations() {
  if (_installationsPromise) return _installationsPromise
  _installationsPromise = fetch('/api/solar/installations')
    .then(res => { if (!res.ok) throw new Error('API error'); return res.json() })
    .catch(err => { _installationsPromise = null; throw err })
  return _installationsPromise
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

  /**
   * Solar Growth, built from the registry rather than described alongside it.
   *
   * This used to return a hardcoded series and patch only its final year from
   * two CMS KPI rows, so the chart showed 310 installations in 2020 rising to
   * 720, against a registry that records 76 by the end of 2020 and 777 today.
   * Every point is now counted from the permits themselves, cumulatively, so
   * the last point is necessarily the published total.
   */
  getSolarGrowth: async () => {
    try {
      const rows = await fetchSolarInstallations()
      const byYear = new Map()
      rows.forEach((row) => {
        const year = String(row.installDate || '').slice(0, 4)
        if (!/^\d{4}$/.test(year)) return
        const entry = byYear.get(year) || { installations: 0, kw: 0 }
        entry.installations += 1
        if (typeof row.capacity === 'number' && row.capacity > 0) entry.kw += row.capacity
        byYear.set(year, entry)
      })
      const years = [...byYear.keys()].sort()
      if (years.length === 0) return solarGrowthData

      let installations = 0
      let kw = 0
      return years.map((year) => {
        const entry = byYear.get(year)
        installations += entry.installations
        kw += entry.kw
        return { year, capacity: Number((kw / 1000).toFixed(2)), installations }
      })
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

  /**
   * Capacity by Type, in kW, summed from the registry.
   *
   * The previous figures -- Residential 42, Commercial 35, Utility 18,
   * Community 5 -- matched nothing in the data and named a "Community" class the
   * registry does not have. Utility looks small by count and large by capacity
   * because two permits carry it, one of them the 6,000 kW airport array, which
   * is exactly the sort of thing a capacity chart should show.
   */
  getCapacityByType: async () => {
    try {
      const rows = await fetchSolarInstallations()
      const COLORS = {
        Residential: '#0077B6',
        Commercial: '#0B1F3A',
        Utility: '#C9A227',
      }
      const byType = new Map()
      rows.forEach((row) => {
        if (!(typeof row.capacity === 'number' && row.capacity > 0)) return
        const type = row.type || 'Unspecified'
        byType.set(type, (byType.get(type) || 0) + row.capacity)
      })
      if (byType.size === 0) return capacityByType

      return [...byType.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, kw]) => ({ name, value: Math.round(kw), color: COLORS[name] || '#33B0E0' }))
    } catch {
      return capacityByType
    }
  },
  getBatteryStorage: () => Promise.resolve(batteryStorageData),
  getPenetration: () => Promise.resolve(penetrationData),
  getEVByCategory: () => Promise.resolve(evByCategory),
  getChargingInfrastructure: () => Promise.resolve(chargingInfrastructure),
  getPublicTransport: () => Promise.resolve(publicTransportElectrification),
  getEfficiencyMetrics: () => Promise.resolve(energyEfficiencyMetrics),
}
