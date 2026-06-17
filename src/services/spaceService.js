import { spacePages } from '../data/space'
import { fetchFromAPI, fetchMockById, fetchMock } from './api'

const mockList = Object.entries(spacePages).map(([key, value]) => ({ slug: key, ...value }))

export const spaceService = {
  getPage: async (slug) => {
    const items = await fetchFromAPI('/api/spaceContent', mockList)
    const item = items.find(p => p.slug === slug)
    if (!item) return fetchMockById(mockList, slug, 'slug')
    return item
  },
  getAllPages: async () => {
    const items = await fetchFromAPI('/api/spaceContent', mockList)
    return items
  },
}
