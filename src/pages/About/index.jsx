import PageBanner from '../../components/common/PageBanner'
import ContentBlock from '../../components/common/ContentBlock'
import SectionHeading from '../../components/ui/SectionHeading'
import { PAGE_IMAGES } from '../../constants/branding'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAsyncData } from '../../hooks/useAsyncData'
import { leadershipService } from '../../services'

const VALUES = [
  { title: 'Transparency', description: 'Open, accountable governance in energy policy and public engagement.', image: PAGE_IMAGES.transparency },
  { title: 'Sustainability', description: 'Long-term environmental stewardship and climate resilience for Bermuda.', image: PAGE_IMAGES.wind },
  { title: 'Innovation', description: 'Embracing new technologies to modernise our energy systems.', image: PAGE_IMAGES.innovation },
  { title: 'Equity', description: 'Ensuring fair access to clean energy benefits for all Bermudians.', image: PAGE_IMAGES.solar },
]

export default function About() {
  useDocumentTitle('About the Department')
  const { data: team } = useAsyncData(() => leadershipService.getAll(), [])

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
            imageAlt="Bermuda coastline"
          >
            <p>
              The Department of Energy is responsible for developing and implementing Bermuda&apos;s energy policy,
              regulating the energy sector, and promoting the transition to a sustainable, secure, and affordable
              energy system for all residents.
            </p>
            <p className="mt-4">
              We oversee renewable energy programmes, electronic communications, space and satellite services,
              and provide the public with data, tools, and resources to participate in Bermuda&apos;s energy future.
            </p>
          </ContentBlock>

          <ContentBlock
            title="Our Vision"
            subtitle="A cleaner, more resilient Bermuda"
            image={PAGE_IMAGES.solar}
            imageAlt="Solar energy installation"
            reverse
          >
            <p className="text-lg font-medium text-navy-900">
              A Bermuda powered by clean, reliable, and affordable energy ? resilient to climate change and
              positioned as a leader in the Atlantic region.
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
          <SectionHeading title="Leadership" subtitle="Department leadership structure" />
          <div className="grid gap-4 sm:grid-cols-2">
            {(team ?? []).map((member) => (
              <div key={member.id} className="flex gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
                {member.imageUrl && (
                  <img src={member.imageUrl} alt="" className="hidden w-24 shrink-0 self-stretch object-cover object-top sm:block" loading="lazy" />
                )}
                <div className="card-padding flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2E5496] text-sm font-bold text-white sm:hidden" aria-hidden="true">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-teal-700">{member.role}</p>
                    <p className="mt-0.5 font-semibold text-navy-900">{member.name}</p>
                    {member.bio && <p className="mt-1 text-xs text-slate-500">{member.bio}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
