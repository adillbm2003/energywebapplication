const DEFAULT_DELAY = 250

function simulateNetworkDelay(ms = DEFAULT_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchMock(data, options = {}) {
  const { delay = DEFAULT_DELAY, filter } = options

  await simulateNetworkDelay(delay)

  if (filter) {
    return filter(data)
  }

  return data
}

export async function fetchMockById(collection, id, idKey = 'id') {
  const item = collection.find((entry) => String(entry[idKey]) === String(id))
  if (!item) {
    const error = new Error('Resource not found')
    error.status = 404
    throw error
  }
  return fetchMock(item)
}

/**
 * Try the real API when VITE_API_URL is set; fall back to mock data otherwise.
 * This lets the frontend run fully offline with mock data and switch to the
 * live backend simply by setting the env variable.
 */
/**
 * Fetch from the real API when VITE_API_URL is set; fall back to mock data otherwise.
 * Also falls back to mock when the API returns an empty array (CMS not yet populated).
 * This means mock data acts as seed content until CMS editors upload real data.
 */
export function toRelativeUrl(url) {
  if (!url) return null
  if (!url.startsWith('http')) return url
  // In production VITE_API_URL is set — keep absolute so images load from the backend host.
  // In dev it's unset — strip origin so the Vite proxy (/uploads, /api) handles it.
  if (import.meta.env.VITE_API_URL) return url
  try { return new URL(url).pathname } catch { return url }
}

export async function fetchFromAPI(path, fallback) {
  const base = import.meta.env.VITE_API_URL ?? ''
  try {
    const res = await fetch(`${base}${path}`, { credentials: 'include' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // In development, mock data acts as seed content when the CMS is empty.
    if (import.meta.env.DEV && Array.isArray(data) && data.length === 0) return fetchMock(fallback)
    return data
  } catch (error) {
    // In production never substitute mock/demo content for real data — surface an
    // empty result so pages render their empty state instead of fabricated content.
    if (import.meta.env.DEV) return fetchMock(fallback)
    console.warn(`API request failed for ${path}:`, error)
    // Content lists collapse to empty (never fabricated); object-shaped fallbacks
    // (settings, dashboard config) return their defaults to avoid runtime crashes.
    return Array.isArray(fallback) ? [] : fallback
  }
}
