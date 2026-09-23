import PageBanner from '../../components/common/PageBanner'
import ContentBlock from '../../components/common/ContentBlock'
import SectionHeading from '../../components/ui/SectionHeading'
import { PAGE_IMAGES } from '../../constants/branding'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { fetchFromAPI } from '../../services/api'

const VALUES = [
  { title: 'Transparency', description: 'Open, accountable governance in energy policy and public engagement.', image: PAGE_IMAGES.solarWorkers },
  // Was PAGE_IMAGES.floatingSolar -- panels moored on open water. Bermuda has no
  // floating solar array, so it illustrated a technology the island does not use.
  // This is a photograph of a real Bermuda solar field.
  { title: 'Sustainability', description: 'Long-term environmental stewardship and climate resilience for Bermuda.', image: PAGE_IMAGES.solarFieldBermuda },
  { title: 'Innovation', description: 'Embracing new technologies to modernise our energy systems.', image: PAGE_IMAGES.satellite },
  { title: 'Equity', description: 'Ensuring fair access to clean energy benefits for all Bermudians.', image: PAGE_IMAGES.bhcHousing },
]

const PORTRAIT_CYCLE = [
  PAGE_IMAGES.portrait1,
  PAGE_IMAGES.portrait2,
  PAGE_IMAGES.portrait3,
  PAGE_IMAGES.portrait4,
  PAGE_IMAGES.portrait5,
  PAGE_IMAGES.portrait6,
]

const BASE = import.meta.env.BASE_URL || '/'

function getPortrait(member, index) {
  if (member.imageUrl) {
    if (member.imageUrl.startsWith('/images/')) return BASE + member.imageUrl.slice(1)
    if (member.imageUrl.startsWith('/uploads/')) return member.imageUrl
    if (!member.imageUrl.includes('portrait.jpg')) return member.imageUrl
  }
  return PORTRAIT_CYCLE[index % PORTRAIT_CYCLE.length]
}

export default function About() {
  useDocumentTitle('About the Department')

  const { data: team } = useAsyncData(() => fetchFromAPI('/api/leadership', []), [])

  return (
    <>
      <PageBanner
        title="About the Department of Energy"
        subtitle="Leading Bermuda's energy transition through policy, regulation, and public service."
        breadcrumbs={[{ label: 'About', to: '/about' }]}
        image={PAGE_IMAGES.government}
      />

      <section className="section-padding">
        <div className="container-page space-y-16">
          <ContentBlock
            title="Our Mission"
            image={PAGE_IMAGES.home}
            imageAlt="Placeholder — image to be confirmed"
          >
            <p className="text-lg font-medium text-navy-900">
              To support the development of policy and legislation for the space, energy, and
              telecommunications industries.
            </p>
          </ContentBlock>

          <ContentBlock
            title="The Department Overview"
            image={PAGE_IMAGES.bermudaVision}
            imageAlt="Aerial view of Bermuda coastline"
            reverse
          >
            <p>
              The Department of Energy supports the development of policy and legislation for Bermuda&apos;s
              energy, telecommunications, space and satellite industries. The Department advises and supports
              the Minister in promoting affordable, secure, and sustainable energy, modern digital connectivity,
              and resilient infrastructure, while fostering a stable and enabling regulatory environment that
              supports innovation, investment, and economic growth.
            </p>
            <p className="mt-4">
              Through policy development, legislative reform, stakeholder engagement, and public outreach, the
              Department works collaboratively with regulators, Government ministries, statutory bodies, and
              industry partners to advance national priorities, reduce reliance on imported fossil fuels,
              address cost-of-living pressures, and position Bermuda as a competitive jurisdiction within the
              global energy and space economy.
            </p>
          </ContentBlock>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeading title="Our Values" subtitle="Principles that guide our work" align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div key={value.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white card-shadow transition-all hover:-translate-y-1 hover:card-shadow-hover">
                <img src={value.image} alt="" className="h-32 w-full object-cover" loading="lazy" />
                <div className="card-padding text-center">
                  <h3>{value.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <SectionHeading
            title="Department Leadership"
            subtitle="The team responsible for energy policy, regulation, and service delivery in Bermuda"
          />
          {team && team.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.filter(m => m.status === 'Active').map((member, index) => (
                <div key={member.id} className="flex gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
                  {member.imageUrl && (
                    <img
                      src={getPortrait(member, index)}
                      alt=""
                      className="h-full w-28 shrink-0 object-cover object-top"
                      loading="lazy"
                    />
                  )}
                  <div className="card-padding flex flex-col justify-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">{member.role}</p>
                    <p className="mt-1 font-semibold text-navy-900 leading-snug">{member.name}</p>
                    {member.bio && (
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{member.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
