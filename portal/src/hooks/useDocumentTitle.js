import { useEffect } from 'react'

const BASE_TITLE = 'Department of Energy | Government of Bermuda'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Department of Energy` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [title])
}
