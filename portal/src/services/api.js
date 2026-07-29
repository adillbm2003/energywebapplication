export async function fetchMock(data, options = {}) {
  const { filter } = options
  return filter ? filter(data) : data
}

export async function fetchMockById(collection, id, idKey = 'id') {
  const item = collection.find((entry) => String(entry[idKey]) === String(id))
  if (!item) {
    const error = new Error('Resource not found')
    error.status = 404
    throw error
  }
  return item
}

export async function fetchFromAPI(endpoint, fallbackData) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    // In development, mock data acts as seed content when the CMS is empty.
    if (import.meta.env.DEV && Array.isArray(data) && data.length === 0) return fallbackData;
    return data;
  } catch (error) {
    // In production we NEVER substitute mock/demo content for real content — a
    // government portal must not display fabricated data during a backend outage.
    // Return an empty result so pages render their empty state instead.
    if (import.meta.env.DEV) {
      console.warn(`Failed to fetch from API endpoint ${endpoint}, falling back to mock data:`, error);
      return fallbackData;
    }
    console.warn(`Failed to fetch from API endpoint ${endpoint}:`, error);
    // Content lists collapse to empty (never fabricated); object-shaped fallbacks
    // (settings, dashboard config) return their defaults to avoid runtime crashes.
    return Array.isArray(fallbackData) ? [] : fallbackData;
  }
}
