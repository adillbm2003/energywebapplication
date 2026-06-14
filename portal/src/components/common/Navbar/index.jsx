import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MAIN_NAV } from '../../../constants/navigation'
import Logo from '../Logo'
import { BRANDING } from '../../../constants/branding'
import { cn } from '../../../utils/cn'

const navLinkClass = ({ isActive }) =>
  cn(
    'whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors lg:px-2.5 lg:py-2 lg:text-sm',
    isActive ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white',
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
          'flex items-center gap-0.5 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white lg:gap-1 lg:px-2.5 lg:py-2 lg:text-sm',
          open && 'bg-white/10 text-white',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
      >
        {item.label}
        <svg className="h-3.5 w-3.5 shrink-0 lg:h-4 lg:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full z-50 mt-1 min-w-[220px] rounded-xl border border-slate-200 bg-white py-2 card-shadow-hover',
              alignRight ? 'right-0' : 'left-0',
            )}
            role="menu"
          >
            <NavLink
              to={item.to}
              className="block border-b border-slate-100 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  cn(
                    'block px-4 py-2.5 text-sm transition-colors',
                    isActive ? 'bg-teal-50 font-medium text-teal-700' : 'text-slate-700 hover:bg-slate-50',
                  )
                }
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                {child.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-navy-900 text-white shadow-lg shadow-navy-950/20">
      <div className="border-b border-white/10 bg-[#2E5496]">
        <div className="container-page flex items-center justify-between py-1.5 text-xs text-white/90">
          <span className="font-medium tracking-wide">{BRANDING.governmentName}</span>
          <a href={`tel:${BRANDING.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
            {BRANDING.phone}
          </a>
        </div>
      </div>

      <div className="container-page flex items-center gap-3 py-2.5 lg:py-3">
        <Logo variant="header" className="shrink-0" />

        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 md:flex lg:gap-1"
          aria-label="Main navigation"
        >
          {MAIN_NAV.map((item, index) => (
            <NavDropdown
              key={item.label}
              item={item}
              alignRight={index >= MAIN_NAV.length - 3}
            />
          ))}
        </nav>

        <button
          type="button"
          className="ml-auto shrink-0 rounded-md p-2 text-slate-200 hover:bg-white/10 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <nav className="container-page max-h-[70vh] space-y-1 overflow-y-auto py-4" aria-label="Mobile navigation">
              {MAIN_NAV.map((item) =>
                item.children ? (
                  <div key={item.label} className="space-y-1">
                    <NavLink
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider',
                          isActive ? 'bg-teal-600/25 text-teal-200' : 'text-slate-400 hover:bg-white/10 hover:text-slate-200',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'block rounded-md px-3 py-2.5 pl-6 text-sm',
                            isActive ? 'bg-teal-600/25 text-teal-200' : 'text-slate-200 hover:bg-white/10',
                          )
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-md px-3 py-2.5 text-sm font-medium',
                        isActive ? 'bg-teal-600/25 text-teal-200' : 'text-slate-200 hover:bg-white/10',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ),
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
