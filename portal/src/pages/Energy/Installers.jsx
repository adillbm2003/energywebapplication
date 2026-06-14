import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import InstallerCard from '../../components/cards/InstallerCard'
import SectionHeading from '../../components/ui/SectionHeading'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
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
        subtitle="Official list of certified solar photovoltaic installers in Bermuda."
        image={PAGE_IMAGES.solar}
        breadcrumbs={[
          { label: 'Energy', to: ROUTES.energy },
          { label: 'Registered Installers', to: ROUTES.installers },
        ]}
      />

      <section className="section-padding">
        <div className="container-page">
          <SectionHeading
            title="Certified Installers"
            subtitle="All installers listed below are registered with the Department of Energy. Contact installers directly for quotes and installation services."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {installers?.map((installer) => (
              <InstallerCard key={installer.id} installer={installer} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
