import { Link } from 'react-router-dom'

import PageBanner from '../../components/common/PageBanner'
import { PAGE_IMAGES } from '../../constants/branding'

import SectionHeading from '../../components/ui/SectionHeading'


import { useDocumentTitle } from '../../hooks/useDocumentTitle'

import { SPACE_NAV } from '../../constants/navigation'

import { ROUTES } from '../../constants/routes'

import { spacePages } from '../../data/space'



export default function SpaceSatellite() {

  useDocumentTitle('Space & Satellite')



  const pages = SPACE_NAV.filter((item) => item.slug)



  return (

    <>

      <PageBanner

        title="Space & Satellite"

        subtitle="Bermuda's space and satellite sector is supported by a framework for satellite network filings, earth station licensing, and regulatory administration, guided by the Department of Energy and applicable international obligations."

        breadcrumbs={[{ label: 'Space & Satellite', to: ROUTES.spaceSatellite }]}
        image={PAGE_IMAGES.spaceSatellites}
      />



      <section className="section-padding">

        <div className="container-page">

          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">

            <div>

              <SectionHeading title="Gateway to the Global Space Economy" className="mb-4" />

              <p className="text-body-small text-slate-600">

                Bermuda supports space and satellite sector activities through its experience in satellite

                communications, satellite network filings, and international regulatory engagement.

              </p>

            </div>

            <div className="overflow-hidden rounded-xl">

              <img

                src={PAGE_IMAGES.satellite}

                alt=""

                className="aspect-[4/3] w-full object-cover"

                loading="lazy"

              />

            </div>

          </div>

        </div>

      </section>



      <section className="section-padding bg-white">

        <div className="container-page">

          <SectionHeading title="Explore the Space Sector" subtitle="Policy, regulation, and the framework for satellite activities" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {pages.map((page) => {
              const pageData = spacePages[page.slug]
              const image = pageData?.image || PAGE_IMAGES.satellite

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

