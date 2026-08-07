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
      // NOTE: the slug is derived from the title rather than read from the
      // stored `slug` column. Most stored slugs carry a generated timestamp
      // suffix (…-1782231456340), so honouring them would turn every existing
      // article URL into an unreadable one. Set titles with the URL in mind.
      slug: slugify(n.title) || n.id,
      category: n.category || 'Renewable Energy',
      // Was omitted from this projection, so the article page always rendered
      // "by" with nothing after it even when an author was set in the CMS.
      author: n.author || '',
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
