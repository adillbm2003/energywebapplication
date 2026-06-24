import { useParams, Navigate } from 'react-router-dom'
import PageBanner from '../../components/common/PageBanner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { newsService } from '../../services'
import { ROUTES } from '../../constants/routes'
import { formatDate } from '../../utils/format'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import SafeImage from '../../components/common/SafeImage'
import { resolveNewsImage } from '../../utils/contentImages'

export default function NewsArticle() {
  const { slug } = useParams()
  const { data: article, loading, error } = useAsyncData(() => newsService.getBySlug(slug), [slug])

  useDocumentTitle(article?.title || 'News')

  if (loading) return <LoadingSpinner />
  if (error || !article) return <Navigate to="/404" replace />

  return (
    <>
      <PageBanner
        title={article.title}
        breadcrumbs={[
          { label: 'News', to: ROUTES.news },
          { label: article.title, to: ROUTES.newsArticle(article.slug) },
        ]}
        image={resolveNewsImage(article)}
      />

      <article className="section-padding">
        <div className="container-page max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Badge>{article.category}</Badge>
            <time className="text-sm text-slate-500" dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            <span className="text-sm text-slate-500">by {article.author}</span>
          </div>

          <div className="mb-8 flex justify-center rounded-xl overflow-hidden bg-slate-50">
            <SafeImage
              src={resolveNewsImage(article)}
              alt=""
              className="max-h-[560px] w-auto max-w-full object-contain"
            />
          </div>

          <div className="prose prose-slate max-w-none">
            {(Array.isArray(article.content) ? article.content : [article.content].filter(Boolean)).map((paragraph, i) => (
              <p key={i} className="mb-4 text-slate-600 leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          <Button to={ROUTES.news} variant="outline" className="mt-8">
            ← Back to News
          </Button>
        </div>
      </article>
    </>
  )
}
