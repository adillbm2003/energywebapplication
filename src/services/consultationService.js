import { consultations } from '../data/consultations'
import { fetchFromAPI } from './api'
import { sortByNewest } from '../utils/sortContent'

export const consultationService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/consultations', consultations);
    return sortByNewest(items.map(c => ({
      id: c.id,
      title: c.title,
      summary: c.description || c.summary,
      status: c.status === 'Open' ? 'active' : (c.status === 'Closed' ? 'completed' : c.status || 'upcoming'),
      openingDate: c.startDate || c.openingDate,
      closingDate: c.endDate || c.closingDate,
      externalUrl: c.externalUrl || c.relatedLinks || null,
      relatedArticles: c.relatedArticles || [],
    })), ['openingDate']);
  },
  getActive: async () => {
    const all = await consultationService.getAll();
    return all.filter((c) => c.status === 'active' || c.status === 'Open');
  },
}
