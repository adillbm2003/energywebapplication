import { useEffect, useState } from 'react'

export function useAsyncData(fetcher, deps = [], initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(initialData === null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    // Only block with spinner when there is nothing to show yet
    if (initialData === null) setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
