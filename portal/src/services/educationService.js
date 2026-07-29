import { educationResources, educationCategories } from '../data/education'

const INFOGRAPHIC_GUIDES = educationResources.filter(r => r.type === 'Infographic')

let _promise = null

async function fetchEducation() {
  if (_promise) return _promise
  _promise = fetch('/api/education')
    .then(res => { if (!res.ok) throw new Error('API error'); return res.json() })
    .catch(err => { _promise = null; throw err })
  return _promise
}

export const educationService = {
  getAll: async () => {
    try {
      const items = await fetchEducation()
      const apiResources = items.map(item => {
        const isVideo = item.type === 'Video'
        const fileUrl = item.pdfLink || item.videoUrl || '#'
        return {
          id: item.id,
          title: item.title,
          category: item.category,
          type: isVideo ? 'Video' : 'Guide',
          description: item.description,
          image: item.image || null,
          [isVideo ? 'videoUrl' : 'downloadUrl']: fileUrl,
          fileSize: isVideo ? undefined : '1.5 MB',
          duration: isVideo ? '15 min' : undefined,
          relatedRoute: '#',
        }
      })
      const apiIds = new Set(apiResources.map(r => r.id))
      const nonDuplicateGuides = INFOGRAPHIC_GUIDES.filter(g => !apiIds.has(g.id))
      return [...nonDuplicateGuides, ...apiResources]
    } catch {
      return educationResources
    }
  },
  getCategories: async () => {
    try {
      const items = await fetchEducation()
      const apiCats = items.map(item => item.category)
      return [...new Set(['Appliance Guides', 'Renewable Energy', 'EVs', ...apiCats])]
    } catch {
      return educationCategories
    }
  },
}
