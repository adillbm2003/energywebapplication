import { Link } from 'react-router-dom'
import { FOOTER_LINKS } from '../../../constants/navigation'
import { EXTERNAL_LINKS } from '../../../constants/externalLinks'
import { BRANDING } from '../../../constants/branding'
import { useSiteSettings } from '../../../contexts/SiteSettingsContext'
import Logo from '../Logo'
import NewsletterForm from '../../forms/NewsletterForm'

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0b1f3a"/>
      </svg>
    ),
  },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const { phone } = useSiteSettings()

  return (
    <footer className="bg-navy-900 text-slate-300" role="contentinfo">
      {/* Top gradient accent */}
      <div className="h-0.5 bg-gradient-to-r from-teal-600 via-[#2E5496] to-gold-500" aria-hidden="true" />

      <div className="container-page pt-12 pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">

          {/* Brand column */}
          <div className="lg:col-span-4">
            <Logo variant="footer" linkTo="/" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Bermuda&apos;s authoritative source for energy policy, renewable data, public consultations, and education resources.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-slate-400 transition-all hover:bg-teal-600 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="mt-5 text-xs text-slate-500">
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-teal-400 transition-colors">
                {phone}
              </a>
            </p>
          </div>

          {/* Department links */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-200">Department</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.department.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-200">Resources</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* External links */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-200">External</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={EXTERNAL_LINKS.govBm}
                  className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  gov.bm ↗
                </a>
              </li>
              <li>
                <a
                  href={EXTERNAL_LINKS.consultationsForum}
                  className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultations Forum ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-200">Stay Informed</h3>
            <NewsletterForm />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-white/8 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
            <p>&copy; {year} {BRANDING.governmentName}. All rights reserved.</p>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1.5" aria-label="Legal">
              {FOOTER_LINKS.legal.map((link) => (
                <Link key={link.to} to={link.to} className="hover:text-teal-400 transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
