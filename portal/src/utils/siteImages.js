import { PAGE_IMAGES, BRANDING } from '../constants/branding'

/**
 * Applies CMS image overrides on top of the images bundled with the build.
 *
 * Every page reads its imagery from the shared PAGE_IMAGES object, so assigning
 * the overrides onto that same object updates the whole site from one place —
 * no page needs to know the CMS exists. Callers re-render once this resolves.
 *
 * Failure is deliberately silent: if the API is unreachable the site simply
 * keeps the bundled defaults rather than rendering broken images.
 */
export async function loadSiteImageOverrides() {
  const base = import.meta.env.VITE_API_URL ?? ''
  try {
    const res = await fetch(`${base}/api/site-images`, { credentials: 'include' })
    if (!res.ok) return 0

    const overrides = await res.json()
    if (!overrides || typeof overrides !== 'object') return 0

    let applied = 0
    for (const [key, url] of Object.entries(overrides)) {
      if (!url) continue
      if (key === 'logoPublic') {
        BRANDING.logo = url
        BRANDING.logoPublic = url
        applied++
        continue
      }
      if (key in PAGE_IMAGES) {
        PAGE_IMAGES[key] = url
        applied++
      }
    }
    return applied
  } catch {
    return 0
  }
}
