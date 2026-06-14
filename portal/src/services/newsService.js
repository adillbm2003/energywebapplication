import { news } from '../data/news'
import { fetchMock, fetchMockById, fetchFromAPI } from './api'
import { slugify } from '../utils/format'

export const newsService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/news', news);
    const published = items.filter(n => n.status === 'Published');
    return published.map(n => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      content: n.content,
      image: n.image,
      publishDate: n.publishDate,
      slug: slugify(n.title) || n.id,
      category: n.category || 'Renewable Energy',
      featured: n.featured !== false
    }));
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
