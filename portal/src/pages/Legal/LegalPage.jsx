import { useLocation, Navigate } from 'react-router-dom'
import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    content: [
      'The Department of Energy, Government of Bermuda, is committed to protecting your personal information in accordance with the Personal Information Protection Act (PIPA).',
      'This website collects limited personal information when you submit enquiry forms or subscribe to updates. Information is used solely for responding to your requests and providing Department services.',
      'We do not sell personal information to third parties. Data is retained within the Department of Energy in accordance with government records management policies.',
      'You have the right to access, correct, or request deletion of your personal information. Contact energy@gov.bm for privacy enquiries.',
    ],
  },
  terms: {
    title: 'Terms of Use',
    content: [
      'This website is operated by the Department of Energy, Government of Bermuda. By using this site, you agree to these terms.',
      'Content on this website is provided for general information purposes. While we endeavour to keep information accurate and up to date, the Department makes no warranties about completeness or accuracy.',
      'Official legislation and policy documents should be verified against published government sources. Nothing on this site constitutes legal or financial advice.',
      'The Government of Bermuda reserves the right to modify these terms at any time. Continued use constitutes acceptance of updated terms.',
    ],
  },
  accessibility: {
    title: 'Accessibility Statement',
    content: [
      'The Department of Energy is committed to ensuring energy.bm is accessible to all users, including people with disabilities.',
      'We aim to conform to WCAG 2.1 Level AA standards, including keyboard navigation, screen reader compatibility, sufficient colour contrast, and resizable text.',
      'If you encounter accessibility barriers on this website, please contact us at energy@gov.bm or +1 (441) 295-5000. We will endeavour to provide information in an alternative format.',
      'This statement will be reviewed and updated as the website evolves.',
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    content: [
      'This website uses essential cookies required for basic functionality and security. We may use analytics cookies to understand how visitors use the site.',
      'Essential cookies cannot be disabled as they are necessary for the website to function. Analytics cookies help us improve content and user experience.',
      'You can control cookie preferences through your browser settings. Disabling cookies may affect some website functionality.',
      'For questions about our use of cookies, contact energy@gov.bm.',
    ],
  },
}

export default function LegalPage() {
  const { pathname } = useLocation()
  const type = pathname.replace('/', '')
  const page = LEGAL_CONTENT[type]

  useDocumentTitle(page?.title || 'Legal')

  if (!page) return <Navigate to="/" replace />

  return (
    <>
      <PageBanner title={page.title} breadcrumbs={[{ label: page.title, to: pathname }]} image={PAGE_IMAGES.government} />
      <section className="section-padding">
        <div className="container-page max-w-3xl">
          {page.content.map((paragraph, i) => (
            <p key={i} className="mb-4 text-slate-600 leading-relaxed">{paragraph}</p>
          ))}
          <p className="mt-8 text-sm text-slate-500 italic">Draft for review — subject to Department approval.</p>
        </div>
      </section>
    </>
  )
}
