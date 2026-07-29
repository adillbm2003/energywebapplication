import { createContext, useContext, useEffect, useState } from 'react'
import { BRANDING } from '../constants/branding'

const SiteSettingsContext = createContext({ phone: BRANDING.phone })

export function SiteSettingsProvider({ children }) {
  const [phone, setPhone] = useState(BRANDING.phone)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.contactPhone) setPhone(data.contactPhone)
      })
      .catch(() => {})
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ phone }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
