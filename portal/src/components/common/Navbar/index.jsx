import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MAIN_NAV } from '../../../constants/navigation'
import Logo from '../Logo'
import { BRANDING } from '../../../constants/branding'
import { useSiteSettings } from '../../../contexts/SiteSettingsContext'
import { cn } from '../../../utils/cn'

const navLinkClass = ({ isActive }) =>
  cn(
    'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-white/20 text-white shadow-sm'
      : 'text-slate-200/90 hover:bg-white/10 hover:text-white',
  )

function NavDropdown({ item, alignRight = false }) {
  const [open, setOpen] = useState(false)

  if (!item.children) {
    return (
      <NavLink to={item.to} className={navLinkClass}>
        {item.label}
      </NavLink>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          'flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          open ? 'bg-white/20 text-white shadow-sm' : 'text-slate-200/90 hover:bg-white/10 hover:text-white',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
      >
        {item.label}
        <svg
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', open && 'rotate-180')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-navy-900/15',
              alignRight ? 'right-0' : 'left-0',
            )}
            role="menu"
          >
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3">
              <NavLink
                to={item.to}
                className="text-sm font-semibold text-white/90 hover:text-white transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                {item.overviewLabel ?? item.label} overview →
              </NavLink>
            </div>
            <div className="py-1.5">
              {item.children.map((child) => {
                const childClass = cn(
                  'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-slate-700 hover:bg-slate-50 hover:text-teal-700',
                )
                if (child.href) {
                  return (
                    <a
                      key={child.href}
                      href={child.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={childClass}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50 shrink-0" aria-hidden="true" />
                      {child.label}
                      <svg className="ml-auto h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )
                }
                return (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                        isActive
                          ? 'bg-teal-50 font-semibold text-teal-700'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-teal-700',
                      )
                    }
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50 shrink-0" aria-hidden="true" />
                    {child.label}
                  </NavLink>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileNavItem({ item, onClose }) {
  const [expanded, setExpanded] = useState(false)

  if (!item.children) {
    return (
      <NavLink
        to={item.to}
        onClick={onClose}
        className={({ isActive }) =>
          cn(
            'flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors',
            isActive ? 'bg-teal-600/25 text-teal-200' : 'text-slate-200 hover:bg-white/10 hover:text-white',
          )
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
      >
        {item.label}
        <svg
          className={cn('h-4 w-4 transition-transform duration-200', expanded && 'rotate-180')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-4 pb-2">
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive ? 'text-teal-300 font-semibold' : 'text-slate-400 hover:text-slate-200',
                  )
                }
              >
                {item.overviewLabel ?? item.label} overview
              </NavLink>
              {item.children.map((child) => {
                if (child.href) {
                  return (
                    <a
                      key={child.href}
                      href={child.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {child.label} ↗
                    </a>
                  )
                }
                return (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive ? 'text-teal-300 font-semibold' : 'text-slate-300 hover:text-white',
                      )
                    }
                  >
                    {child.label}
                  </NavLink>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { phone } = useSiteSettings()

  useEffect(() => { setMobileOpen(false) }, [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-navy-900/95 shadow-xl shadow-navy-950/30 backdrop-blur-md'
          : 'bg-navy-900',
      )}
    >
      {/* Government top bar */}
      <div className="border-b border-white/8 bg-navy-950/60">
        <div className="container-page flex items-center justify-between py-1.5 text-xs text-slate-300/80">
          <Link to="/" className="flex items-center gap-2 font-medium tracking-wide hover:text-white transition-colors">
            <span className="hidden sm:inline">{BRANDING.governmentName}</span>
            <span className="sm:hidden">Gov. of Bermuda</span>
          </Link>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="hover:text-white transition-colors"
          >
            {phone}
          </a>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="container-page flex items-center gap-4 py-2.5 lg:py-3">
        <Logo variant="header" className="shrink-0" />

        {/* Desktop nav */}
        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 md:flex lg:gap-1"
          aria-label="Main navigation"
        >
          {MAIN_NAV.map((item, index) => (
            <NavDropdown
              key={item.label}
              item={item}
              alignRight={index >= MAIN_NAV.length - 2}
            />
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="ml-auto shrink-0 rounded-xl border border-white/15 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/10 bg-navy-900/95 backdrop-blur-md md:hidden"
          >
            <nav className="container-page max-h-[75vh] space-y-1 overflow-y-auto py-4" aria-label="Mobile navigation">
              {MAIN_NAV.map((item) => (
                <MobileNavItem key={item.label} item={item} onClose={() => setMobileOpen(false)} />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
