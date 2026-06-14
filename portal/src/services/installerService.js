import { certifiedInstallers } from '../data/installers'
import { fetchMock, fetchFromAPI } from './api'

export const installerService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/installers', certifiedInstallers);
    const active = items.filter(item => item.status === 'Active');
    return active.map((item) => {
      return {
        id: item.id,
        name: item.name,
        parish: item.parish || 'Hamilton',
        website: item.website,
        certifications: item.certifications ? item.certifications.split(',').map(c => c.trim()) : ['Registered Solar PV Installer', 'Battery Storage'],
        projects: parseInt(item.projects) || 0,
        rating: parseFloat(item.rating) || 5.0,
        description: item.description || `Certified installer: ${item.name}. Contact details: ${item.contact || 'No contact details available.'}`
      };
    });
  },
}
