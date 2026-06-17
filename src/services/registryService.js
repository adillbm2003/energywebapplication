import { registryEntries } from '../data/installers'
import { fetchFromAPI } from './api'

export const registryService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/solarInstallations', registryEntries)
    return items.map(e => ({
      id: e.id,
      name: e.name,
      parish: e.parish,
      type: e.type,
      capacity: e.capacity,
      status: e.status || 'Active',
      installDate: e.installDate || e.install_date,
      installer: e.installer,
    }))
  },
  getParishes: async () => {
    const items = await registryService.getAll()
    return [...new Set(items.map(e => e.parish).filter(Boolean))]
  },
  getTypes: async () => {
    const items = await registryService.getAll()
    return [...new Set(items.map(e => e.type).filter(Boolean))]
  },
}
