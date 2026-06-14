import { useMemo, useState, useCallback } from 'react'
import { paginate } from '../utils/pagination'

export function usePagination(items, initialPageSize = 9) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const result = useMemo(() => paginate(items, page, pageSize), [items, page, pageSize])

  const goToPage = useCallback((nextPage) => {
    setPage(Math.max(1, Math.min(nextPage, result.totalPages)))
  }, [result.totalPages])

  const resetPage = useCallback(() => {
    setPage(1)
  }, [])

  return {
    ...result,
    setPage: goToPage,
    setPageSize,
    resetPage,
  }
}
