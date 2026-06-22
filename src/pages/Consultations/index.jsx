import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { consultationService } from '../../services'
import { formatDate } from '../../utils/format'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { EXTERNAL_LINKS } from '../../constants/externalLinks'
import RelatedArticles from '../../components/ui/RelatedArticles'

function ConsultationCard({ consultation }) {
  const forumUrl = consultation.externalUrl || EXTERNAL_LINKS.consultationsForum

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-shadow hover:card-shadow-hover">
      <div className="card-padding">
        <Badge status={consultation.status === 'Open' || consultation.status === 'active' ? 'active' : 'completed'}>
          {consultation.status === 'Open' || consultation.status === 'active' ? 'Open for Submissions' : 'Closed'}
        </Badge>
        <h3 className="mt-3 text-lg font-semibold text-navy-900">{consultation.title}</h3>
        {consultation.summary && (
          <p className="mt-2 text-sm text-slate-600">{consultation.summary}</p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {consultation.openingDate && (
            <div>
              <dt className="text-slate-500">Opens</dt>
              <dd className="font-medium">{formatDate(consultation.openingDate)}</dd>
            </div>
          )}
          {consultation.closingDate && (
            <div>
              <dt className="text-slate-500">Closes</dt>
              <dd className="font-medium">{formatDate(consultation.closingDate)}</dd>
            </div>
          )}
        </dl>
        {(consultation.status === 'Open' || consultation.status === 'active') && (
          <div className="mt-5">
            <Button
              href={forumUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="sm"
            >
              Submit Your Response →
            </Button>
          </div>
        )}
        {consultation.relatedArticles?.length > 0 && (
          <div className="mt-4">
            <RelatedArticles articles={consultation.relatedArticles} />
          </div>
        )}
      </div>
    </article>
  )
}

export default function Consultations() {
  useDocumentTitle('Consultations')
  const { data, loading } = useAsyncData(() => consultationService.getAll(), [])

  if (loading) return <LoadingSpinner />

  const active = data?.filter((c) => c.status === 'active' || c.status === 'Open') ?? []
  const past = data?.filter((c) => c.status !== 'active' && c.status !== 'Open') ?? []

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

          {/* Citizens Forum notice */}
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
            <p className="text-sm text-teal-800">
              <strong>How to participate:</strong> All public consultations are submitted through the{' '}
              <a
                href={EXTERNAL_LINKS.consultationsForum}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-teal-900"
              >
                Government Consultations Forum
              </a>
              . Click "Submit Your Response" on any open consultation below to be taken directly to the submission portal.
            </p>
          </div>

          {/* Active consultations */}
          <section aria-labelledby="active-consultations-heading">
            <h2 id="active-consultations-heading" className="mb-6 text-xl font-bold text-navy-900">
              Open Consultations
            </h2>
            {active.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-500">There are no open consultations at this time.</p>
                <p className="mt-2 text-sm text-slate-400">
                  Check back regularly or visit the{' '}
                  <a
                    href={EXTERNAL_LINKS.consultationsForum}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 underline hover:text-teal-700"
                  >
                    Government Consultations Forum
                  </a>{' '}
                  for updates.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {active.map((c) => <ConsultationCard key={c.id} consultation={c} />)}
              </div>
            )}
          </section>

          {/* Past consultations */}
          {past.length > 0 && (
            <section aria-labelledby="past-consultations-heading">
              <h2 id="past-consultations-heading" className="mb-6 text-xl font-bold text-navy-900">
                Past Consultations
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {past.map((c) => <ConsultationCard key={c.id} consultation={c} />)}
              </div>
            </section>
          )}

        </div>
      </section>
    </>
  )
}
