import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAsyncData } from '../../hooks/useAsyncData'

describe('useAsyncData', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() =>
      useAsyncData(() => new Promise(() => {}), [])
    )
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('returns data on success', async () => {
    const { result } = renderHook(() =>
      useAsyncData(() => Promise.resolve({ value: 42 }), [])
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ value: 42 })
    expect(result.current.error).toBeNull()
  })

  it('returns error on failure', async () => {
    const { result } = renderHook(() =>
      useAsyncData(() => Promise.reject(new Error('fetch failed')), [])
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.data).toBeNull()
  })
})
