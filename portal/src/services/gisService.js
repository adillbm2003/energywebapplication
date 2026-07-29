import { gisInstallations } from '../data/installers'

let _cache = null

async function fetchInstallations() {
  if (_cache) return _cache
  try {
    const res = await fetch('/api/solar/installations')
    if (!res.ok) throw new Error('API error')
    _cache = await res.json()
    return _cache
  } catch (err) {
    console.warn('GIS fallback:', err)
    _cache = gisInstallations
    return _cache
  }
}

export const gisService = {
  getInstallations: fetchInstallations,
  getParishes: async () => {
    const all = await fetchInstallations()
    return [...new Set(all.map(i => i.parish))].sort()
  },
  getTypes: async () => {
    const all = await fetchInstallations()
    return [...new Set(all.map(i => i.type))].filter(Boolean).sort()
  },
}
