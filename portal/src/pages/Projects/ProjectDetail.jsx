import { useParams, Navigate } from 'react-router-dom'
import PageBanner from '../../components/common/PageBanner'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { projectService } from '../../services'
import { ROUTES } from '../../constants/routes'
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
          <div className="space-y-8">
            <div className="space-y-5">
              <SafeImage
                src={resolveProjectImage(project)}
                alt=""
                className="w-full rounded-lg object-cover max-h-96"
              />

              <div>
                <h2 className="text-xl font-bold text-navy-900">Overview</h2>
                <p className="mt-3 text-slate-600 leading-relaxed">{project.summary}</p>
              </div>


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

            {/* The sidebar held a metadata card and a Documents list. Its two dates
                came from nowhere: every record has a null timeline, so the service
                fell back to a literal 2026-01-01 and 2028-12-31, identical on every
                project. The documents all carried url "#" and were handed to
                downloadMockDocument, which built a PDF out of the summary text --
                files the Department never wrote. Only the back link survives. */}
            <Button to={ROUTES.projects} variant="outline">
              ← Back to Projects
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
