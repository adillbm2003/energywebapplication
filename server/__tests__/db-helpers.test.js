// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// db.cjs opens a pg Pool at import time. Pool construction is lazy (no socket is
// opened until a query runs), so importing for the pure helpers is safe.
const db = require('../../db.cjs')

describe('snakeToCamel', () => {
  it('converts snake_case keys to camelCase', () => {
    expect(db.snakeToCamel({ publish_date: '2026-01-01', target_site: 'A' }))
      .toEqual({ publishDate: '2026-01-01', targetSite: 'A' })
  })

  it('maps user_name to user (audit log convention)', () => {
    expect(db.snakeToCamel({ user_name: 'jsmith' })).toEqual({ user: 'jsmith' })
  })

  it('maps arrays of rows', () => {
    expect(db.snakeToCamel([{ item_id: 1 }, { item_id: 2 }]))
      .toEqual([{ itemId: 1 }, { itemId: 2 }])
  })

  it('renders a midnight DATE using local components, not UTC', () => {
    // Regression guard: toISOString() would shift this back a day in any UTC+ zone.
    const midnight = new Date(2026, 0, 15, 0, 0, 0, 0)
    expect(db.snakeToCamel({ publish_date: midnight }).publishDate).toBe('2026-01-15')
  })

  it('keeps full ISO form for a timestamp that has a time component', () => {
    const withTime = new Date(2026, 0, 15, 13, 45, 0, 0)
    expect(db.snakeToCamel({ modified_at: withTime }).modifiedAt).toBe(withTime.toISOString())
  })

  it('passes through null and primitives untouched', () => {
    expect(db.snakeToCamel(null)).toBeNull()
    expect(db.snakeToCamel('text')).toBe('text')
    expect(db.snakeToCamel(42)).toBe(42)
  })
})

describe('camelToSnake', () => {
  it('converts camelCase keys to snake_case', () => {
    expect(db.camelToSnake({ publishDate: 'x', targetSite: 'A' }))
      .toEqual({ publish_date: 'x', target_site: 'A' })
  })

  it('maps user back to user_name', () => {
    expect(db.camelToSnake({ user: 'jsmith' })).toEqual({ user_name: 'jsmith' })
  })

  it('round-trips with snakeToCamel', () => {
    const original = { itemId: 'abc', collectionName: 'policies', versionNumber: 3 }
    expect(db.snakeToCamel(db.camelToSnake(original))).toEqual(original)
  })
})

describe('executeTransaction', () => {
  function fakeClient() {
    return { query: vi.fn().mockResolvedValue({ rows: [] }), release: vi.fn() }
  }

  afterEach(() => vi.restoreAllMocks())

  it('commits and returns the callback result', async () => {
    const client = fakeClient()
    vi.spyOn(db.pool, 'connect').mockResolvedValue(client)

    const result = await db.executeTransaction(async () => 'done')

    expect(result).toBe('done')
    expect(client.query).toHaveBeenCalledWith('BEGIN')
    expect(client.query).toHaveBeenCalledWith('COMMIT')
    expect(client.release).toHaveBeenCalled()
  })

  it('rolls back and rethrows when the callback fails', async () => {
    const client = fakeClient()
    vi.spyOn(db.pool, 'connect').mockResolvedValue(client)

    await expect(db.executeTransaction(async () => { throw new Error('boom') }))
      .rejects.toThrow('boom')

    expect(client.query).toHaveBeenCalledWith('ROLLBACK')
    expect(client.query).not.toHaveBeenCalledWith('COMMIT')
    expect(client.release).toHaveBeenCalled()
  })
})
