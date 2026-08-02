import { PAGE_IMAGES, BRANDING } from '../constants/branding'

/** Give up on the overrides rather than delay the site if the API is slow. */
const TIMEOUT_MS = 2500

/**
 * Applies CMS image overrides on top of the images bundled with the build.
 *
 * MUST run before the first render. Several pages capture their imagery into
 * module-level constants, e.g.
 *
 *   const VALUES = [{ title: 'Transparency', image: PAGE_IMAGES.solarWorkers }]
 *
 * which is evaluated once when that module is first imported. Patching
 * PAGE_IMAGES after the fact — from an effect, say — leaves those constants
 * holding the original paths, so uploads appear to do nothing. Every page is
 * lazy-loaded, so applying the overrides before the initial render means each
 * page module evaluates against the patched values when its chunk loads.
 *
 * Failure is deliberately silent: if the API is unreachable the site keeps the
 * bundled defaults rather than rendering broken images.
 */
export async function loadSiteImageOverrides() {
  const base = import.meta.env.VITE_API_URL ?? ''
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${base}/api/site-images`, {
      credentials: 'include',
      signal: controller.signal,
    })
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
  } finally {
    clearTimeout(timer)
  }
}
