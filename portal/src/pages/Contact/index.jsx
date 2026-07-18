import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SectionHeading from '../../components/ui/SectionHeading'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'

export default function Contact() {
  useDocumentTitle('Contact')
  const { phone } = useSiteSettings()

  const officeInfo = [
    { label: 'Address', value: 'Government Administration Building, 30 Parliament Street, Hamilton HM 12, Bermuda' },
    { label: 'Phone', value: phone },
    { label: 'Email', value: 'energy@gov.bm' },
    { label: 'Hours', value: 'Monday – Friday, 9:00 AM – 5:00 PM' },
  ]

  return (
    <>
      <PageBanner
        title="Contact Us"
        subtitle="Get in touch with the Department of Energy."
        breadcrumbs={[{ label: 'Contact', to: '/contact' }]}
        image={PAGE_IMAGES.government}
      />

      <section className="section-padding">
        <div className="container-page max-w-2xl">
          <div className="rounded-xl border border-slate-200 bg-white card-padding card-shadow">
            <SectionHeading title="Office Information" className="mb-6" />
            <dl className="divide-y divide-slate-100">
              {officeInfo.map((item) => (
                <div key={item.label} className="flex gap-6 py-4 first:pt-0 last:pb-0">
                  <dt className="w-16 shrink-0 text-sm font-semibold text-slate-500 pt-0.5">{item.label}</dt>
                  <dd className="text-navy-900">
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

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <img
              src={PAGE_IMAGES.contact}
              alt="Hamilton, Bermuda"
              className="h-64 w-full object-cover"
              loading="lazy"
            />
            <p className="bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
              Government Administration Building, Hamilton HM 12
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
