import { registryEntries } from '../data/installers'
import { fetchMock, fetchFromAPI } from './api'

export const registryService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/solarInstallations', registryEntries);
    return items.map(item => ({
      id: item.id,
      name: item.name,
      parish: item.parish,
      type: item.type,
      capacity: parseFloat(item.capacity) || 0,
      status: item.status || 'Active',
      installDate: item.installDate,
      installer: item.installer
    }));
  },
  getParishes: async () => {
    const all = await registryService.getAll();
    return [...new Set(all.map((e) => e.parish))];
  },
  getTypes: async () => {
    const all = await registryService.getAll();
    return [...new Set(all.map((e) => e.type))];
  },
}
