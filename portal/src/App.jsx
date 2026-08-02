import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext'
import { loadSiteImageOverrides } from './utils/siteImages'

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  // CMS image overrides are merged into the shared PAGE_IMAGES object, which is
  // read during render rather than held in state. Bumping this counter once the
  // fetch resolves re-renders the tree so the new images are picked up.
  const [, setImageRevision] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadSiteImageOverrides().then((applied) => {
      if (!cancelled && applied > 0) setImageRevision((n) => n + 1)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <BrowserRouter basename={routerBasename}>
      <SiteSettingsProvider>
        <AppRoutes />
      </SiteSettingsProvider>
    </BrowserRouter>
  )
}

export default App
