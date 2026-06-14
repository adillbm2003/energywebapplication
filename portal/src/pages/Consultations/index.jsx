import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { consultationService } from '../../services'
import { EXTERNAL_LINKS } from '../../constants/externalLinks'
import { formatDate } from '../../utils/format'
import { downloadMockDocument } from '../../utils/mockDownload'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import SafeImage from '../../components/common/SafeImage'
import { resolveContentImage } from '../../utils/contentImages'

function ConsultationCard({ consultation }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-shadow hover:card-shadow-hover">
      <div className="aspect-[16/9] overflow-hidden">
        <SafeImage
          src={resolveContentImage(consultation.image, 'consultation')}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="card-padding">
      <Badge status={consultation.status}>
        {consultation.status === 'active' ? 'Active' : consultation.status === 'upcoming' ? 'Upcoming' : 'Completed'}
      </Badge>
      <h3 className="mt-3 text-lg font-semibold text-navy-900">{consultation.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{consultation.summary}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-slate-500">Opens</dt>
          <dd className="font-medium">{formatDate(consultation.openingDate)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Closes</dt>
          <dd className="font-medium">{formatDate(consultation.closingDate)}</dd>
        </div>
      </dl>
      {consultation.documents.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Documents</h4>
          <ul className="mt-2 space-y-1">
            {consultation.documents.map((doc) => (
              <li key={doc.title}>
                <button
                  type="button"
                  onClick={() => downloadMockDocument({ title: doc.title, summary: consultation.summary, category: 'Consultation' })}
                  className="text-left text-sm text-teal-600 hover:text-teal-700 hover:underline"
                >
                  {doc.title} ({doc.size})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        <strong className="text-navy-900">Submission instructions:</strong> Submit responses via the{' '}
        <a href={EXTERNAL_LINKS.consultationsForum} className="text-teal-600 underline" target="_blank" rel="noopener noreferrer">
          Government Consultations Forum
        </a>{' '}
        or email energy@gov.bm.
      </div>
      {consultation.status === 'active' && (
        <Button href={EXTERNAL_LINKS.consultationsForum} variant="primary" size="sm" className="mt-4" target="_blank" rel="noopener noreferrer">
          Submit Response
        </Button>
      )}
      </div>
    </article>
  )
}

function ConsultationSection({ title, items, emptyMessage }) {
  if (!items?.length) {
    return (
      <section aria-labelledby={title.toLowerCase().replace(/\s/g, '-')}>
        <h2 id={title.toLowerCase().replace(/\s/g, '-')} className="mb-6 text-xl font-bold text-navy-900">{title}</h2>
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </section>
    )
  }
  return (
    <section aria-labelledby={title.toLowerCase().replace(/\s/g, '-')}>
      <h2 id={title.toLowerCase().replace(/\s/g, '-')} className="mb-6 text-xl font-bold text-navy-900">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((c) => <ConsultationCard key={c.id} consultation={c} />)}
      </div>
    </section>
  )
}

export default function Consultations() {
  useDocumentTitle('Consultations')
  const { data, loading } = useAsyncData(() => consultationService.getAll(), [])
  if (loading) return <LoadingSpinner />

  const active = data?.filter((c) => c.status === 'active') ?? []
  const upcoming = data?.filter((c) => c.status === 'upcoming') ?? []
  const completed = data?.filter((c) => c.status === 'completed') ?? []

  return (
    <>
      <PageBanner
        title="Public Consultations"
        subtitle="Participate in shaping Bermuda's energy, telecommunications, and space policy."
        breadcrumbs={[{ label: 'Consultations', to: '/consultations' }]}
        image={PAGE_IMAGES.consultation}
      />
      <section className="section-padding">
        <div className="container-page space-y-12">
          <div className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white p-6">
            <h2 className="font-semibold text-navy-900">How to participate</h2>
            <p className="mt-2 text-sm text-slate-600">
              The Government of Bermuda hosts public consultations on{' '}
              <a href={EXTERNAL_LINKS.consultationsForum} className="font-medium text-teal-600 underline" target="_blank" rel="noopener noreferrer">forum.gov.bm</a>.
              Download consultation documents below and submit your response through the forum.
            </p>
          </div>
          <ConsultationSection title="Active Consultations" items={active} emptyMessage="No active consultations at this time." />
          <ConsultationSection title="Upcoming Consultations" items={upcoming} emptyMessage="No upcoming consultations scheduled." />
          <ConsultationSection title="Completed Consultations" items={completed} emptyMessage="No completed consultations to display." />
        </div>
      </section>
    </>
  )
}
