import { Link } from 'react-router-dom'
import { FOOTER_LINKS } from '../../../constants/navigation'
import { EXTERNAL_LINKS } from '../../../constants/externalLinks'
import { BRANDING } from '../../../constants/branding'
import { useSiteSettings } from '../../../contexts/SiteSettingsContext'
import Logo from '../Logo'
import NewsletterForm from '../../forms/NewsletterForm'

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
