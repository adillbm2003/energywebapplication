import { fetchFromAPI, toRelativeUrl } from './api'

const STATIC_TEAM = [
  { id: 'lead-001', name: 'The Honourable Minister', role: 'Minister of Energy', imageUrl: '/images/portrait.jpg', bio: '', displayOrder: 1 },
  { id: 'lead-002', name: 'Permanent Secretary for Energy', role: 'Permanent Secretary', imageUrl: '', bio: '', displayOrder: 2 },
  { id: 'lead-003', name: 'Director of Energy Policy', role: 'Director of Energy Policy', imageUrl: '/images/portrait.jpg', bio: '', displayOrder: 3 },
  { id: 'lead-004', name: 'Director of Renewable Energy', role: 'Director of Renewable Energy', imageUrl: '/images/portrait.jpg', bio: '', displayOrder: 4 },
]

export const leadershipService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/leadership', STATIC_TEAM)
    return items
      .filter(m => (m.status || 'Active') === 'Active')
      .map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        imageUrl: toRelativeUrl(m.imageUrl || m.image_url) || '/images/portrait.jpg',
        bio: m.bio || '',
        displayOrder: m.displayOrder || m.display_order || 0,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder)
  },
}
