import Button from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'
import { PAGE_IMAGES } from '../../constants/branding'

export default function NotFound() {
  useDocumentTitle('Page Not Found')

  return (
    <section className="flex min-h-[60vh] items-center justify-center section-padding">
      <div className="container-page text-center">
        <div className="mx-auto mb-8 max-w-lg overflow-hidden rounded-xl">
          <img src={PAGE_IMAGES.bermuda} alt="" className="aspect-[16/9] w-full object-cover opacity-80" loading="lazy" />
        </div>
        <p className="text-display text-teal-600" aria-hidden="true">404</p>
        <h1 className="mt-3">Page Not Found</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-600">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button to={ROUTES.home} variant="primary">Return Home</Button>
          <Button to={ROUTES.contact} variant="outline">Contact Us</Button>
        </div>
      </div>
    </section>
  )
}
