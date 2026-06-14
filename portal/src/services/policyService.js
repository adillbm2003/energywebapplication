import { policies, policyTracker } from '../data/policies'
import { fetchMock, fetchFromAPI } from './api'

export const policyService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/policies', policies);
    return items.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      type: p.category,
      summary: p.description,
      publishedAt: p.effectiveDate,
      status: p.status,
      downloadUrl: p.pdfLink,
      fileSize: '1.2 MB',
      tags: [p.category ? p.category.toLowerCase() : 'policy']
    }));
  },
  getTracker: async () => {
    const items = await fetchFromAPI('/api/tracker', policyTracker);
    return items.map(t => ({
      id: t.id,
      title: t.name,
      category: t.type,
      sector: t.sector,
      type: t.type,
      status: t.statusLabel,
      stage: t.stage,
      department: 'Department of Energy',
      dateInitiated: t.lastUpdated,
      lastUpdated: t.lastUpdated,
      nextMilestone: 'Next review milestone',
      progress: t.progress,
      summary: t.name + ' - Current Stage: ' + t.stage
    }));
  },
  getCategories: async () => {
    const all = await policyService.getAll();
    return [...new Set(all.map((item) => item.category))];
  },
}
