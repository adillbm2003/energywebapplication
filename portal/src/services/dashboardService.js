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
import { fetchMock, fetchFromAPI } from './api'

export const dashboardService = {
  getHomeStats: async () => {
    try {
      const res = await fetch('/api/kpis');
      if (!res.ok) throw new Error('API error');
      const kpis = await res.json();
      
      const newStats = JSON.parse(JSON.stringify(homeStats));
      
      const capKpi = kpis.find(k => k.id === 'kpi-1');
      if (capKpi) {
        newStats[0].value = capKpi.value;
        newStats[0].unit = capKpi.unit;
      }
      
      const evKpi = kpis.find(k => k.id === 'kpi-2');
      if (evKpi) {
        newStats[2].value = parseFloat(evKpi.value).toLocaleString();
      }
      
      return newStats;
    } catch (err) {
      console.warn("Failed to fetch KPIs, falling back:", err);
      return fetchMock(homeStats);
    }
  },
  
  getRenewableKPIs: async () => {
    try {
      const res = await fetch('/api/kpis');
      if (!res.ok) throw new Error('API error');
      const kpis = await res.json();
      
      const newKpis = JSON.parse(JSON.stringify(renewableKPIs));
      
      const capKpi = kpis.find(k => k.id === 'kpi-1');
      if (capKpi) {
        newKpis[0].value = parseFloat(capKpi.value);
        newKpis[0].unit = capKpi.unit;
      }
      
      return newKpis;
    } catch (err) {
      return fetchMock(renewableKPIs);
    }
  },
  
  getSolarGrowth: async () => {
    try {
      const res = await fetch('/api/kpis');
      if (!res.ok) throw new Error('API error');
      const kpis = await res.json();
      
      const newSolarGrowth = JSON.parse(JSON.stringify(solarGrowthData));
      
      const capKpi = kpis.find(k => k.id === 'kpi-1');
      const sysKpi = kpis.find(k => k.id === 'kpi-3');
      
      if (newSolarGrowth.length > 0) {
        const lastIdx = newSolarGrowth.length - 1;
        if (capKpi) newSolarGrowth[lastIdx].capacity = parseFloat(capKpi.value);
        if (sysKpi) newSolarGrowth[lastIdx].installations = parseInt(sysKpi.value);
      }
      
      return newSolarGrowth;
    } catch (err) {
      return fetchMock(solarGrowthData);
    }
  },
  
  getTransitionKPIs: async () => {
    try {
      const res = await fetch('/api/kpis');
      if (!res.ok) throw new Error('API error');
      const kpis = await res.json();
      
      const newTransition = JSON.parse(JSON.stringify(transitionKPIs));
      const evKpi = kpis.find(k => k.id === 'kpi-2');
      
      if (evKpi) {
        newTransition[0].value = parseInt(evKpi.value);
      }
      
      return newTransition;
    } catch (err) {
      return fetchMock(transitionKPIs);
    }
  },
  
  getEVAdoption: async () => {
    try {
      const res = await fetch('/api/kpis');
      if (!res.ok) throw new Error('API error');
      const kpis = await res.json();
      
      const newEv = JSON.parse(JSON.stringify(evAdoptionData));
      const evKpi = kpis.find(k => k.id === 'kpi-2');
      
      if (newEv.length > 0 && evKpi) {
        newEv[newEv.length - 1].evs = parseInt(evKpi.value);
      }
      
      return newEv;
    } catch (err) {
      return fetchMock(evAdoptionData);
    }
  },
  
  getCapacityByType: () => fetchMock(capacityByType),
  getBatteryStorage: () => fetchMock(batteryStorageData),
  getPenetration: () => fetchMock(penetrationData),
  getEVByCategory: () => fetchMock(evByCategory),
  getChargingInfrastructure: () => fetchMock(chargingInfrastructure),
  getPublicTransport: () => fetchMock(publicTransportElectrification),
  getEfficiencyMetrics: () => fetchMock(energyEfficiencyMetrics),
}
