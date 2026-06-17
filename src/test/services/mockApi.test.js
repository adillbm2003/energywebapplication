import { describe, it, expect } from 'vitest'
import { fetchMock, fetchMockById } from '../../services/api'

describe('fetchMock', () => {
  it('returns data after delay', async () => {
    const data = { foo: 'bar' }
    const result = await fetchMock(data, { delay: 0 })
    expect(result).toEqual(data)
  })

  it('applies filter function when provided', async () => {
    const data = [1, 2, 3, 4]
    const result = await fetchMock(data, { delay: 0, filter: (d) => d.filter((n) => n > 2) })
    expect(result).toEqual([3, 4])
  })
})

describe('fetchMockById', () => {
  const collection = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
  ]

  it('returns matching item', async () => {
    const item = await fetchMockById(collection, '1')
    expect(item.name).toBe('Alpha')
  })

  it('throws 404 for missing id', async () => {
    await expect(fetchMockById(collection, '99')).rejects.toMatchObject({ status: 404 })
  })
})
