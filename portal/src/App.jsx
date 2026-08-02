import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext'

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

// CMS image overrides are applied in main.jsx before this renders — they cannot
// be loaded from an effect here, because page modules read PAGE_IMAGES into
// module-level constants as their chunks evaluate, which happens first.
function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <SiteSettingsProvider>
        <AppRoutes />
      </SiteSettingsProvider>
    </BrowserRouter>
  )
}

export default App
