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
    return data;
  } catch (error) {
    console.warn(`Failed to fetch from API endpoint ${endpoint}, falling back to mock data:`, error);
    return fallbackData;
  }
}
