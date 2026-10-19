import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { bursaryService } from '../../services'
import { bursaryProgramme, bursaryFAQs, bursaryPathwayImages } from '../../data/bursary'

export default function Bursary() {
  useDocumentTitle('Energy Bursary Programme')

  const { data: programme } = useAsyncData(() => bursaryService.getProgramme(), [], bursaryProgramme)
  const { data: faqs } = useAsyncData(() => bursaryService.getFAQs(), [], bursaryFAQs)
  // Empty fallback on purpose: if the API cannot be reached, show no recipients
  // rather than the placeholder students in data/bursary.js, who are not real.
  const { data: recipients } = useAsyncData(() => bursaryService.getRecipients(), [], [])
  const shownRecipients = (recipients || []).filter((r) => r && r.name)

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
                <img src={PAGE_IMAGES.bursaryOverview} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
              </div>
              <SectionHeading title="Programme Overview" className="mb-4" />
              <p className="text-slate-600 leading-relaxed">{programme?.overview}</p>
              <Button href={programme?.scholarshipLink} variant="primary" className="mt-6" target="_blank" rel="noopener noreferrer">
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

          {shownRecipients.length > 0 && (
            <div>
              <SectionHeading title="Meet the Recipients" subtitle="Bermudian students supported by the programme" />
              <div className="grid gap-5 md:grid-cols-2">
                {shownRecipients.map((r) => {
                  // Production fills these; local records carry a two-line `bio`
                  // instead. Render whichever is present.
                  const lines = [r.education, r.background, r.achievement, r.focus].filter(Boolean)
                  const bioLines = !lines.length && r.bio ? String(r.bio).split('\n').map((l) => l.trim()).filter(Boolean) : []
                  const paragraphs = lines.length ? lines : bioLines
                  const initials = String(r.name || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <div key={r.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white card-padding card-shadow sm:flex-row">
                      <div className="shrink-0">
                        {r.photoUrl && (
                          <img
                            src={r.photoUrl}
                            alt={r.name}
                            className="h-28 w-28 rounded-xl object-cover"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex' }}
                          />
                        )}
                        <div
                          className="h-28 w-28 items-center justify-center rounded-xl bg-teal-50 text-2xl font-semibold text-teal-700"
                          style={{ display: r.photoUrl ? 'none' : 'flex' }}
                          aria-hidden="true"
                        >
                          {initials}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-navy-900">{r.name}</h3>
                        {[r.fieldOfStudy, r.academicYear].filter(Boolean).length > 0 && (
                          <p className="text-sm font-medium text-teal-700">{[r.fieldOfStudy, r.academicYear].filter(Boolean).join(' · ')}</p>
                        )}
                        {r.school && <p className="text-sm text-slate-500">{r.school}</p>}
                        {paragraphs.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {paragraphs.map((line, i) => (
                              <p key={i} className="text-sm leading-relaxed text-slate-600">{line}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
