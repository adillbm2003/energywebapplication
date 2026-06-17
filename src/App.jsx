import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { setUnauthorizedHandler } from './services/client'

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      // The public portal has no login page — quietly swallow 401s from the
      // CMS API so they never crash the visitor-facing site.
      console.warn('API returned 401 — session may have expired.')
    })
  }, [])

  return (
    <BrowserRouter basename={routerBasename}>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
