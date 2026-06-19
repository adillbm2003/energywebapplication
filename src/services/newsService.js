import { news } from '../data/news'
import { fetchFromAPI, fetchMockById } from './api'
import { sortByNewest } from '../utils/sortContent'

export const newsService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/news', sortByNewest(news, ['publishDate']))
    return sortByNewest(items.map(n => ({
      id: n.id,
      slug: n.slug || String(n.id),
      title: n.title,
      excerpt: n.excerpt || n.summary,
      category: n.category || 'Renewable Energy',
      featured: n.featured ?? false,
      author: n.author || 'Department of Energy',
      publishedAt: n.publishedAt || n.publish_date,
      publishDate: n.publishDate || n.publishedAt || n.publish_date,
      image: n.image,
      content: Array.isArray(n.content) ? n.content : (n.content ? n.content.split('\n\n') : []),
      attachmentUrl: n.attachmentUrl || n.attachment_url || null,
      attachmentName: n.attachmentName || n.attachment_name || null,
    })), ['publishDate'])
  },
  getFeatured: async () => {
    const all = await newsService.getAll()
    return all.filter(n => n.featured).slice(0, 3)
  },
  getBySlug: async (slug) => {
    const all = await newsService.getAll()
    const item = all.find(n => String(n.slug) === String(slug) || String(n.id) === String(slug))
    if (!item) {
      const err = new Error('Resource not found')
      err.status = 404
      throw err
    }
    return item
  },
  getCategories: async () => {
    const all = await newsService.getAll()
    return [...new Set(all.map(n => n.category))]
  },
}
