import { policies, policyTracker } from '../data/policies'
import { fetchFromAPI, toRelativeUrl } from './api'
import { sortByNewest } from '../utils/sortContent'

export const policyService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/policies', sortByNewest(policies, ['publishedAt']))
    return sortByNewest(items.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      summary: p.summary || p.description,
      publishedAt: p.publishedAt || p.effectiveDate || p.publishDate,
      status: p.status,
      downloadUrl: (() => { const u = p.downloadUrl || p.pdfLink; return u && u !== '#' ? toRelativeUrl(u) : null })(),
      fileSize: p.fileSize,
      tags: p.tags,
      image: toRelativeUrl(p.image),
      relatedArticles: p.relatedArticles || [],
    })), ['publishedAt'])
  },
  getTracker: async () => {
    const items = await fetchFromAPI('/api/tracker', sortByNewest(policyTracker, ['lastUpdated']))
    // Normalise to the shape the ProgressTracker page actually reads
    // (title/status/summary/department/nextMilestone). The live `tracker` table
    // uses name/status_label, while the mock data uses title/status — map both so
    // the page renders and the Status filter (which matches on `status`) works.
    return sortByNewest(items.map(t => {
      const status = t.status || t.statusLabel || t.status_label
      return {
        id: t.id,
        title: t.title || t.name,
        name: t.name || t.title,
        type: t.type,
        sector: t.sector,
        category: t.category || t.sector,
        stage: t.stage,
        progress: t.progress,
        status,
        statusLabel: status,
        summary: t.summary || '',
        department: t.department || '',
        nextMilestone: t.nextMilestone || t.next_milestone || '',
        consultationClose: t.consultationClose || t.consultation_close || null,
        image: t.image,
        relatedDocs: t.relatedDocs || t.related_docs,
        lastUpdated: t.lastUpdated || t.last_updated,
      }
    }), ['lastUpdated'])
  },
  getCategories: async () => {
    const all = await policyService.getAll()
    return [...new Set(all.map(p => p.category))]
  },
}
