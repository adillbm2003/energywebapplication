import { policies, policyTracker } from '../data/policies'
import { fetchFromAPI } from './api'
import { sortByNewest } from '../utils/sortContent'

export const policyService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/policies', policies);
    return sortByNewest(items.map(p => {
      const summary = p.description || p.summary || '';
      const category = p.category || 'Policy';
      const title = p.title || '';
      const content = p.content || [
        `${title}`,
        '',
        `This document sets out the Government of Bermuda's position on ${title.toLowerCase()}.`,
        `It has been prepared by the Department of Energy in accordance with Bermuda's energy transition objectives.`,
        '',
        summary,
        '',
        `This ${category.toLowerCase()} applies to all relevant parties operating within Bermuda's jurisdiction.`,
        `Stakeholders are encouraged to review the full document and direct enquiries to the Department of Energy.`,
        '',
        `For additional information, legislation, and supporting documents, visit www.gov.bm or contact energy@gov.bm.`,
      ].filter(Boolean).join('\n');

      return {
        id: p.id,
        title,
        category,
        type: p.category,
        summary,
        content,
        publishedAt: p.effectiveDate || p.publishedAt,
        status: p.status,
        downloadUrl: p.pdfLink || p.downloadUrl,
        fileSize: p.fileSize || '1.2 MB',
        tags: [p.category ? p.category.toLowerCase() : 'policy'],
        image: p.image,
      };
    }), ['publishedAt']);
  },
  getTracker: async () => {
    const items = await fetchFromAPI('/api/tracker', policyTracker);
    return sortByNewest(items.map(t => ({
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
    })), ['lastUpdated']);
  },
  getCategories: async () => {
    const all = await policyService.getAll();
    return [...new Set(all.map((item) => item.category))];
  },
}
