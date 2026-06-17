import { gisInstallations } from '../data/installers'
import { fetchFromAPI } from './api'

export const gisService = {
  getInstallations: async () => {
    const items = await fetchFromAPI('/api/solarInstallations', gisInstallations)
    return items.map(i => ({
      id: i.id,
      name: i.name,
      parish: i.parish,
      type: i.type,
      capacity: i.capacity,
      status: i.status || 'Active',
      installDate: i.installDate || i.install_date,
      installer: i.installer,
      coordinateX: i.coordinateX ?? i.coordinate_x ?? 50,
      coordinateY: i.coordinateY ?? i.coordinate_y ?? 50,
      notes: i.notes,
    }))
  },
  getParishes: async () => {
    const items = await gisService.getInstallations()
    return [...new Set(items.map(i => i.parish).filter(Boolean))]
  },
  getTypes: async () => {
    const items = await gisService.getInstallations()
    return [...new Set(items.map(i => i.type).filter(Boolean))]
  },
}
