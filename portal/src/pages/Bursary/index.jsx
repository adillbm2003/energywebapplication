import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { bursaryService } from '../../services'
import { bursaryPathwayImages } from '../../data/bursary'
import { formatDate } from '../../utils/format'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function Bursary() {
  useDocumentTitle('Energy Bursary Programme')

  const { data: programme, loading } = useAsyncData(() => bursaryService.getProgramme(), [])
  const { data: faqs } = useAsyncData(() => bursaryService.getFAQs(), [])

  if (loading) return <LoadingSpinner />

  return (
    <>
      <PageBanner
        title="Energy Bursary Programme"
        subtitle="Supporting Bermudian students pursuing careers in energy and sustainability."
        breadcrumbs={[{ label: 'Bursary', to: '/bursary' }]}
        image={PAGE_IMAGES.education}
      />

      <section className="section-padding">
        <div className="container-page space-y-12">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="mb-4 overflow-hidden rounded-xl">
                <img src={PAGE_IMAGES.education} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
              </div>
              <SectionHeading title="Programme Overview" className="mb-4" />
              <p className="text-slate-600 leading-relaxed">{programme?.overview}</p>
              <p className="mt-4 text-sm text-slate-500">
                Application deadline: <strong>{formatDate(programme?.applicationDeadline)}</strong>
              </p>
              <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
                Applications are submitted through the official Bermuda Scholarships portal - not on this website.
              </div>
              <Button href={programme?.scholarshipLink} variant="primary" className="mt-4" target="_blank" rel="noopener noreferrer">
                Apply at bermudascholarships.bm
              </Button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white card-padding card-shadow">
              <h3 className="text-lg font-semibold text-navy-900">Eligibility Requirements</h3>
              <ul className="mt-4 space-y-2">
                {programme?.eligibility.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <SectionHeading title="Career Pathways in Energy" subtitle="Fields supported by the bursary programme" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {programme?.careerPathways.map((path) => (
                <div key={path} className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
                  <img
                    src={bursaryPathwayImages[path] || PAGE_IMAGES.education}
                    alt=""
                    className="h-24 w-full object-cover"
                    loading="lazy"
                  />
                  <p className="p-3 text-sm font-medium text-slate-700">{path}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading title="Frequently Asked Questions" />
            <div className="space-y-3">
              {faqs?.map((faq) => (
                <details key={faq.question} className="rounded-xl border border-slate-200 bg-white card-shadow group">
                  <summary className="cursor-pointer px-5 py-4 font-medium text-navy-900 hover:bg-slate-50">{faq.question}</summary>
                  <p className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
