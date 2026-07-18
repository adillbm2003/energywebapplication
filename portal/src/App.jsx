import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext'

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

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
