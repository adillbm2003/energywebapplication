import { spacePages } from '../data/space'
import { fetchMockById } from './api'

const allPages = Object.entries(spacePages).map(([key, value]) => ({ slug: key, ...value }))

export const spaceService = {
  getPage: (slug) => fetchMockById(allPages, slug, 'slug'),
  getAllPages: () => Promise.resolve(allPages),
}
