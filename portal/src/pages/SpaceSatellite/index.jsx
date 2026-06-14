import { Link } from 'react-router-dom'

import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'

import SectionHeading from '../../components/ui/SectionHeading'

import Button from '../../components/ui/Button'

import { useDocumentTitle } from '../../hooks/useDocumentTitle'

import { SPACE_NAV } from '../../constants/navigation'

import { ROUTES } from '../../constants/routes'

import { EXTERNAL_LINKS } from '../../constants/externalLinks'

import { spacePages } from '../../data/space'



export default function SpaceSatellite() {

  useDocumentTitle('Space & Satellite')



  const pages = SPACE_NAV.filter((item) => item.slug)



  return (

    <>

      <PageBanner

        title="Space & Satellite"

        subtitle="Bermuda - a strategic jurisdiction for space industry investment, satellite filing, and earth station operations."

        breadcrumbs={[{ label: 'Space & Satellite', to: ROUTES.spaceSatellite }]}
        image={PAGE_IMAGES.space}
      />



      <section className="section-padding">

        <div className="container-page">

          <div className="grid gap-6 lg:grid-cols-2">

            <div>

              <SectionHeading title="Gateway to the Global Space Economy" className="mb-4" />

              <p className="text-body-small text-slate-600">

                Bermuda has built a world-class reputation in satellite communications, earth station operations,

                ITU filing services, and space insurance - leveraging decades of regulatory expertise and

                a strategic mid-Atlantic location.

              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <Button to={`${ROUTES.spaceSatellite}/why-choose-bermuda`} variant="primary">Why Choose Bermuda</Button>

                <Button href={EXTERNAL_LINKS.spaceEmail} variant="outline">Contact Space Team</Button>

              </div>

            </div>

            <div className="overflow-hidden rounded-xl">

              <img

                src={PAGE_IMAGES.space}

                alt=""

                className="h-full min-h-[240px] w-full object-cover"

                loading="lazy"

              />

            </div>

          </div>

        </div>

      </section>



      <section className="section-padding bg-white">

        <div className="container-page">

          <SectionHeading title="Explore the Space Sector" subtitle="Policy, regulation, investment, and commercial opportunities" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {pages.map((page) => {
              const pageData = spacePages[page.slug]
              const image = pageData?.image || PAGE_IMAGES.space

              return (
              <Link

                key={page.slug}

                to={page.to}

                className="group overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-1 hover:border-teal-300 hover:card-shadow-hover"

              >
                <img src={image} alt="" className="aspect-[16/9] w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                <div className="card-padding">
                <h3 className="group-hover:text-teal-700">{page.label}</h3>

                <span className="mt-2 inline-block text-body-small font-semibold text-teal-600">Learn more ?</span>
                </div>

              </Link>
              )
            })}

          </div>

        </div>

      </section>

    </>

  )

}

