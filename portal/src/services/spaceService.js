import { spacePages } from '../data/space'
import { fetchMock, fetchMockById } from './api'

export const spaceService = {
  getPage: (slug) => fetchMockById(
    Object.entries(spacePages).map(([key, value]) => ({ slug: key, ...value })),
    slug,
    'slug',
  ),
  getAllPages: () => fetchMock(
    Object.entries(spacePages).map(([key, value]) => ({ slug: key, ...value })),
  ),
}
