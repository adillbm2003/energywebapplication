import { certifiedInstallers } from '../data/installers'
import { fetchFromAPI } from './api'

function pickInstallerLogo(item) {
  if (item.logo) return item.logo
  const name = (item.name || '').toLowerCase()
  if (name.includes('be solar') || name.includes('besolar')) return '/images/installers/be-solar.jpg'
  if (name.includes('sunnyside') || name.includes('sunny side')) return '/images/installers/sunnyside-solar.jpg'
  if (name.includes('aes')) return '/images/installers/aes-solar.png'
  if (name.includes('greenlight')) return '/images/installers/greenlight-energy.svg'
  if (name.includes('bac') || name.includes('bermuda alternative')) return '/images/installers/bac-group.png'
  return null
}

export const installerService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/installers', certifiedInstallers);
    return items
      .filter(item => !item.status || item.status === 'Active')
      .map((item) => ({
        id: item.id,
        name: item.name,
        logo: pickInstallerLogo(item),
        website: item.website || item.contact || null,
        parish: item.parish,
        description: item.description,
        certifications: item.certifications,
        projects: item.projects,
        rating: item.rating,
        image: item.image,
      }));
  },
}
