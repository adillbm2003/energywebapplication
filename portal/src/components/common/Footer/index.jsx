import { Link } from 'react-router-dom'
import { FOOTER_LINKS } from '../../../constants/navigation'
import { EXTERNAL_LINKS } from '../../../constants/externalLinks'
import Logo from '../Logo'
import NewsletterForm from '../../forms/NewsletterForm'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300" role="contentinfo">
      <div className="h-1 bg-gradient-to-r from-[#2E5496] via-teal-600 to-gold-500" aria-hidden="true" />

      <div className="container-page section-padding">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo variant="footer" linkTo="/" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              Bermuda&apos;s authoritative source for energy policy, renewable energy data, consultations, and public resources.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Department</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.department.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-teal-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Resources</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-teal-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Stay Informed</h3>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-navy-950/50">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Government of Bermuda. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {FOOTER_LINKS.legal.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-teal-400 transition-colors">{link.label}</Link>
            ))}
            <a href={EXTERNAL_LINKS.govBm} className="hover:text-teal-400 transition-colors" target="_blank" rel="noopener noreferrer">gov.bm</a>
            <a href={EXTERNAL_LINKS.consultationsForum} className="hover:text-teal-400 transition-colors" target="_blank" rel="noopener noreferrer">Consultations Forum</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
