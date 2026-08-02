import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { loadSiteImageOverrides } from './utils/siteImages'

// Apply the CMS image overrides before the first render. Pages capture their
// imagery into module-level constants when their (lazy) chunk is evaluated, so
// the patch has to land first or those constants keep the bundled defaults.
// loadSiteImageOverrides never rejects and times out on its own, so a slow or
// unreachable API delays the first paint briefly at worst.
await loadSiteImageOverrides()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
