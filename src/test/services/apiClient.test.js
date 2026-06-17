import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiClient, setUnauthorizedHandler } from '../../services/client'

function mockFetch(status, body) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    headers: { get: () => 'application/json' },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(String(body)),
  })
}

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns JSON on successful GET', async () => {
    global.fetch = mockFetch(200, { data: 'ok' })
    const result = await apiClient.get('/api/test')
    expect(result).toEqual({ data: 'ok' })
  })

  it('throws on non-ok status', async () => {
    global.fetch = mockFetch(500, { error: 'Server error' })
    await expect(apiClient.get('/api/fail')).rejects.toThrow('Server error')
  })

  it('calls the unauthorized handler on 401', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    global.fetch = mockFetch(401, { error: 'Unauthorized' })
    await expect(apiClient.get('/api/secure')).rejects.toThrow()
    expect(handler).toHaveBeenCalledOnce()

    setUnauthorizedHandler(null)
  })

  it('throws network error when fetch rejects', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(apiClient.get('/api/test')).rejects.toThrow('Network error')
  })

  it('sends POST body as JSON', async () => {
    const spy = mockFetch(200, { success: true })
    global.fetch = spy
    await apiClient.post('/api/contact', { name: 'Test', email: 'a@b.com' })

    const [, init] = spy.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ name: 'Test', email: 'a@b.com' })
    expect(init.headers['Content-Type']).toBe('application/json')
  })
})
