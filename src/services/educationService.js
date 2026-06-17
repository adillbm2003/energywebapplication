import { educationResources, educationCategories } from '../data/education'
import { fetchFromAPI } from './api'

export const educationService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/education', educationResources)
    return items.map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
      type: e.type,
      description: e.description,
      downloadUrl: e.downloadUrl || e.attachment || e.pdfLink,
      fileSize: e.fileSize,
      image: e.image,
      relatedRoute: e.relatedRoute,
    }))
  },
  getCategories: async () => {
    const items = await fetchFromAPI('/api/education', educationResources)
    if (items.length > 0) return [...new Set(items.map(e => e.category))]
    return educationCategories
  },
}
