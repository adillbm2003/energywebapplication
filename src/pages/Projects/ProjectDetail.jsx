import { useParams, Navigate } from 'react-router-dom'
import PageBanner from '../../components/common/PageBanner'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { projectService } from '../../services'
import { ROUTES } from '../../constants/routes'
import { formatDate } from '../../utils/format'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import SafeImage from '../../components/common/SafeImage'
import { resolveProjectImage } from '../../utils/contentImages'

export default function ProjectDetail() {
  const { id } = useParams()
  const { data: project, loading, error } = useAsyncData(() => projectService.getById(id), [id])

  useDocumentTitle(project?.title || 'Project')

  if (loading) return <LoadingSpinner />
  if (error || !project) return <Navigate to="/404" replace />

  return (
    <>
      <PageBanner
        title={project.title}
        subtitle={project.summary}
        breadcrumbs={[
          { label: 'Projects', to: ROUTES.projects },
          { label: project.title, to: ROUTES.projectDetail(project.id) },
        ]}
        image={resolveProjectImage(project)}
      />

      <section className="section-padding">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <SafeImage
                src={resolveProjectImage(project)}
                alt=""
                className="w-full rounded-lg object-cover max-h-96"
              />

              <div>
                <h2 className="text-xl font-bold text-navy-900">Overview</h2>
                <p className="mt-3 text-slate-600 leading-relaxed">{project.summary}</p>
              </div>

              {project.milestones?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-navy-900">Milestones</h2>
                <ol className="mt-4 space-y-3">
                  {project.milestones.map((milestone, index) => (
                    <li key={milestone.title} className="flex gap-4">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          milestone.completed ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                        aria-hidden="true"
                      >
                        {milestone.completed ? '✓' : index + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${milestone.completed ? 'text-navy-900' : 'text-slate-500'}`}>
                          {milestone.title}
                        </p>
                        <p className="text-sm text-slate-500">{formatDate(milestone.date)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              )}

              {project.gallery?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900">Gallery</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {project.gallery.map((img) => (
                      <img key={img} src={img} alt="" className="rounded-lg object-cover h-48 w-full" loading="lazy" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white card-padding card-shadow">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gold">{project.category}</Badge>
                  <Badge status={project.status === 'Completed' ? 'Completed' : 'In Development'}>
                    {project.status}
                  </Badge>
                </div>
                <ProgressBar value={project.progress} label="Overall Progress" className="mt-4" />
                <dl className="mt-4 space-y-3 text-sm">
                  <div><dt className="text-slate-500">Location</dt><dd className="font-medium">{project.location}</dd></div>
                  <div><dt className="text-slate-500">Start Date</dt><dd>{formatDate(project.startDate)}</dd></div>
                  <div><dt className="text-slate-500">Expected Completion</dt><dd>{formatDate(project.expectedCompletion)}</dd></div>
                  <div><dt className="text-slate-500">Budget</dt><dd className="font-medium">{project.budget}</dd></div>
                </dl>
              </div>

              {project.documents?.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white card-padding card-shadow">
                  <h3 className="font-semibold text-navy-900">Documents</h3>
                  <ul className="mt-3 space-y-2">
                    {project.documents.map((doc) => (
                      <li key={doc.title}>
                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-teal-600 hover:underline"
                          >
                            {doc.title}{doc.size ? ` (${doc.size})` : ''}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-600">{doc.title}{doc.size ? ` (${doc.size})` : ''}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button to={ROUTES.projects} variant="outline" className="w-full">
                ← Back to Projects
              </Button>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
