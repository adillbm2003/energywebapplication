import { consultations } from '../data/consultations'
import { fetchMock, fetchFromAPI } from './api'

export const consultationService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/consultations', consultations);
    return items.map(c => ({
      id: c.id,
      title: c.title,
      summary: c.description,
      status: c.status === 'Open' ? 'active' : (c.status === 'Closed' ? 'completed' : 'upcoming'),
      openingDate: c.startDate,
      closingDate: c.endDate,
      documents: c.supportingDocs ? [{ title: 'Supporting Document', url: c.supportingDocs.startsWith('http') || c.supportingDocs.startsWith('/') ? c.supportingDocs : `/uploads/${c.supportingDocs}`, size: 'PDF' }] : []
    }));
  },
  getByStatus: async (status) => {
    const all = await consultationService.getAll();
    return all.filter((c) => c.status === status);
  },
  getActive: async () => {
    const all = await consultationService.getAll();
    return all.filter((c) => c.status === 'active');
  },
}
