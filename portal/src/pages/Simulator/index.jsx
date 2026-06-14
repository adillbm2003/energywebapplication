import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'
import BermudaEnergySimulator from '../../components/simulator/BermudaEnergySimulator'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants/routes'

export default function Simulator() {
  useDocumentTitle('Home Energy Consumption Simulator')

  return (
    <>
      <PageBanner
        title="Home Energy Consumption Simulator"
        subtitle="Interactive Bermuda home model with live usage and BELCO bill estimates."
        breadcrumbs={[
          { label: 'Data & GIS', to: ROUTES.dashboard },
          { label: 'Energy Simulator', to: ROUTES.simulator },
        ]}
        image={PAGE_IMAGES.home}
      />
      <BermudaEnergySimulator />
    </>
  )
}
