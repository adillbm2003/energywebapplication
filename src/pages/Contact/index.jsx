import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import ContactForm from '../../components/forms/ContactForm'
import SectionHeading from '../../components/ui/SectionHeading'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const OFFICE_INFO = [
  { label: 'Address', value: 'Government Administration Building, 30 Parliament Street, Hamilton HM 12, Bermuda' },
  { label: 'Phone', value: '+1 (441) 444-0597' },
  { label: 'Email', value: 'energy@gov.bm' },
  { label: 'Hours', value: 'Monday ? Friday, 8:30 AM ? 5:00 PM' },
]

export default function Contact() {
  useDocumentTitle('Contact')

  return (
    <>
      <PageBanner
        title="Contact Us"
        subtitle="Get in touch with the Department of Energy."
        breadcrumbs={[{ label: 'Contact', to: '/contact' }]}
        image={PAGE_IMAGES.government}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading title="Send an Inquiry" className="mb-6" />
              <ContactForm />
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white card-padding card-shadow">
                <SectionHeading title="Office Information" className="mb-4" />
                <dl className="space-y-4">
                  {OFFICE_INFO.map((item) => (
                    <div key={item.label}>
                      <dt className="text-sm font-medium text-slate-500">{item.label}</dt>
                      <dd className="mt-1 text-navy-900">
                        {item.label === 'Email' ? (
                          <a href={`mailto:${item.value}`} className="text-teal-600 hover:underline">{item.value}</a>
                        ) : item.label === 'Phone' ? (
                          <a href={`tel:${item.value.replace(/\s/g, '')}`} className="text-teal-600 hover:underline">{item.value}</a>
                        ) : (
                          item.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200" aria-label="Hamilton, Bermuda">
                <img
                  src={PAGE_IMAGES.contact}
                  alt="Hamilton, Bermuda"
                  className="h-64 w-full object-cover"
                  loading="lazy"
                />
                <p className="bg-slate-50 px-4 py-2 text-center text-sm text-slate-600">
                  Government Administration Building, Hamilton HM 12
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
