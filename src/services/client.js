/**
 * HTTP client for the Bermuda DoE backend API.
 *
 * In development with no VITE_API_URL set, every call falls back to the
 * existing mock layer (src/services/api.js) so local dev works with zero
 * backend dependency. Set VITE_API_URL in .env.local to point at the
 * real Express server.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

let onUnauthorized = null

/** Register a callback fired when the server returns 401 (e.g. session expired). */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function request(method, path, body) {
  const url = `${BASE_URL}${path}`

  const init = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }

  if (body !== undefined) {
    init.body = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(url, init)
  } catch (networkErr) {
    const err = new Error('Network error — unable to reach server')
    err.cause = networkErr
    throw err
  }

  if (res.status === 401) {
    if (typeof onUnauthorized === 'function') onUnauthorized()
    const err = new Error('Session expired. Please log in again.')
    err.status = 401
    throw err
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const json = await res.json()
      if (json?.error) message = json.error
    } catch (_) { /* body not JSON */ }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  const contentType = res.headers.get('content-type') ?? ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

export const apiClient = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}
