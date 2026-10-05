import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'
import Button from '../../components/ui/Button'
import RenewableDashboard from '../Dashboard/RenewableDashboard'
import Registry from '../Registry'

// The Renewable Dashboard and the Renewable Energy Registry were two pages
// covering the same subject from two directions: the dashboard summarised the
// permit registry, and the registry listed the permits the dashboard counted.
// They are one page now.
//
// Composed rather than merged. Both pages keep their own file and their own
// state, and each takes an `embedded` prop that drops its banner and its
// document title so this page can own both. Nothing was rewritten to bring
// them together, and separating them again would be as small a change.
export default function RenewableResource() {
  useDocumentTitle('Renewable Energy Resource')

  return (
    <>
      <PageBanner
        title="Renewable Energy Resource"
        subtitle="Installed solar capacity, storage and renewable penetration, with the register of installations behind them."
        breadcrumbs={[
          { label: 'Data & GIS', to: ROUTES.dashboard },
          { label: 'Renewable Energy Resource', to: ROUTES.renewableResource },
        ]}
        image={PAGE_IMAGES.solarFieldBermuda}
      />

      <RenewableDashboard embedded />
      <Registry embedded />

      <section className="section-padding bg-slate-50 pt-0">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white card-padding card-shadow">
            <div>
              <p className="text-body-small font-semibold text-navy-900">Looking for electric vehicles and public transport?</p>
              <p className="text-caption text-slate-600">Those figures live on the Energy Transition Dashboard.</p>
            </div>
            <Button to={ROUTES.transitionDashboard} variant="outline">Energy Transition Dashboard</Button>
          </div>
        </div>
      </section>
    </>
  )
}
