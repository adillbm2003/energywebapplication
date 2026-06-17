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
export async function fetchFromAPI(path, fallback) {
  const base = import.meta.env.VITE_API_URL
  if (!base) return fetchMock(fallback)
  try {
    const res = await fetch(`${base}${path}`, { credentials: 'include' })
    if (!res.ok) return fetchMock(fallback)
    const data = await res.json()
    if (Array.isArray(data) && data.length === 0) return fetchMock(fallback)
    return data
  } catch {
    return fetchMock(fallback)
  }
}
