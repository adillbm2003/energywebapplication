import { gisInstallations } from '../data/installers'
import { fetchMock, fetchFromAPI } from './api'

export const gisService = {
  getInstallations: async () => {
    const items = await fetchFromAPI('/api/solarInstallations', gisInstallations);
    return items.map(item => {
      const lat = parseFloat(item.lat) || (32.38 - (parseFloat(item.coordinateY) || 50) * 0.0015);
      const lng = parseFloat(item.lng) || (-64.90 + (parseFloat(item.coordinateX) || 50) * 0.0025);
      return {
        id: item.id,
        name: item.name,
        parish: item.parish,
        capacity: parseFloat(item.capacity) || 0,
        type: item.type,
        x: parseFloat(item.coordinateX) || 50,
        y: parseFloat(item.coordinateY) || 50,
        lat,
        lng
      };
    });
  },
  getParishes: async () => {
    const all = await gisService.getInstallations();
    return [...new Set(all.map((i) => i.parish))];
  },
  getTypes: async () => {
    const all = await gisService.getInstallations();
    return [...new Set(all.map((i) => i.type))];
  },
}
