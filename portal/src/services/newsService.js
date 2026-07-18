import { news } from '../data/news'
import { fetchMockById, fetchFromAPI } from './api'
import { slugify } from '../utils/format'
import { sortByNewest } from '../utils/sortContent'
import { PAGE_IMAGES } from '../constants/branding'

function pickNewsImage(n) {
  const text = `${n.title || ''} ${n.slug || ''}`.toLowerCase()
  if (text.includes('bursary') && text.includes('recipient')) return PAGE_IMAGES.summerStudentPhoto
  return n.image
}

export const newsService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/news', news);
    const published = items.filter(n => n.status === 'Published');
    return sortByNewest(published.map(n => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      content: Array.isArray(n.content)
        ? n.content
        : n.content
          ? n.content.split(/\r?\n\r?\n+/).map(s => s.trim()).filter(Boolean)
          : [],
      image: pickNewsImage(n),
      publishDate: n.publishDate,
      slug: slugify(n.title) || n.id,
      category: n.category || 'Renewable Energy',
      featured: n.featured !== false
    })), ['publishDate']);
  },
  getFeatured: async () => {
    const all = await newsService.getAll();
    return all.filter((item) => item.featured);
  },
  getBySlug: async (slug) => {
    const all = await newsService.getAll();
    const item = all.find(item => item.slug === slug);
    if (!item) {
      const byId = all.find(item => item.id === slug);
      if (!byId) throw new Error("Article not found");
      return byId;
    }
    return item;
  },
  getCategories: async () => {
    const all = await newsService.getAll();
    return [...new Set(all.map((item) => item.category))];
  },
}
