import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import InstallerCard from '../../components/cards/InstallerCard'
import SectionHeading from '../../components/ui/SectionHeading'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { installerService } from '../../services/installerService'
import { ROUTES } from '../../constants/routes'

export default function Installers() {
  useDocumentTitle('Registered Solar PV Installers')

  const { data: installers, loading } = useAsyncData(() => installerService.getAll(), [])

  if (loading) return <LoadingSpinner />

  return (
    <>
      <PageBanner
        title="Registered Solar PV Installers"
        subtitle="Official list of companies registered with the Department of Energy to install solar photovoltaic systems in Bermuda."
        image={PAGE_IMAGES.solar}
        breadcrumbs={[
          { label: 'Energy', to: ROUTES.energy },
          { label: 'Registered Installers', to: ROUTES.installers },
        ]}
      />

      <section className="section-padding">
        <div className="container-page">
          <SectionHeading
            title="Registered Solar PV Installers"
            subtitle="All companies listed below are registered with the Department of Energy. Contact them directly for quotes and installation services."
          />

          {!installers?.length ? (
            <EmptyState
              title="No registered installers found"
              description="Please check back later or contact the Department of Energy directly."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {installers.map((installer) => (
                <InstallerCard key={installer.id} installer={installer} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
