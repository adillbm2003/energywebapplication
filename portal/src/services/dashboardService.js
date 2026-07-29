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

export const dashboardService = {
  getHomeStats: async () => {
    try {
      const kpis = await fetchKPIs()
      const newStats = JSON.parse(JSON.stringify(homeStats))
      const capKpi = kpis.find(k => k.id === 'kpi-1')
      if (capKpi) { newStats[0].value = capKpi.value; newStats[0].unit = capKpi.unit }
      const evKpi = kpis.find(k => k.id === 'kpi-2')
      if (evKpi) newStats[2].value = parseFloat(evKpi.value).toLocaleString()
      return newStats
    } catch {
      return homeStats
    }
  },

  getRenewableKPIs: async () => {
    try {
      const kpis = await fetchKPIs()
      const newKpis = JSON.parse(JSON.stringify(renewableKPIs))
      const capKpi = kpis.find(k => k.id === 'kpi-1')
      if (capKpi) { newKpis[0].value = parseFloat(capKpi.value); newKpis[0].unit = capKpi.unit }
      return newKpis
    } catch {
      return renewableKPIs
    }
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
