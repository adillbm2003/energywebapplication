import { describe, it, expect } from 'vitest'
import { formatDate, formatNumber, formatPercent, formatCurrency, slugify } from '../../utils/format'

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2024-01-15')
    expect(result).toMatch(/January/)
    expect(result).toMatch(/2024/)
  })

  it('returns em-dash for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('returns em-dash for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('—')
  })
})

describe('formatNumber', () => {
  it('formats a number', () => {
    const result = formatNumber(1000)
    expect(result).toMatch(/1/)
  })

  it('returns em-dash for null', () => {
    expect(formatNumber(null)).toBe('—')
  })

  it('returns em-dash for NaN', () => {
    expect(formatNumber(NaN)).toBe('—')
  })
})

describe('formatPercent', () => {
  it('formats a percentage with one decimal', () => {
    expect(formatPercent(42.5)).toBe('42.5%')
  })

  it('returns em-dash for null', () => {
    expect(formatPercent(null)).toBe('—')
  })
})

describe('formatCurrency', () => {
  it('includes currency formatting', () => {
    const result = formatCurrency(5000)
    expect(result).toBeTruthy()
    expect(result).not.toBe('—')
  })
})

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World!')).toBe('hello-world')
  })

  it('collapses multiple separators', () => {
    expect(slugify('foo   bar')).toBe('foo-bar')
  })
})
