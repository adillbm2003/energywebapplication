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
    return sortByNewest(items.map(t => ({
      id: t.id,
      name: t.name || t.title,
      type: t.type,
      sector: t.sector,
      stage: t.stage,
      progress: t.progress,
      statusLabel: t.statusLabel || t.status_label || t.status,
      relatedDocs: t.relatedDocs || t.related_docs,
      lastUpdated: t.lastUpdated || t.last_updated,
    })), ['lastUpdated'])
  },
  getCategories: async () => {
    const all = await policyService.getAll()
    return [...new Set(all.map(p => p.category))]
  },
}
