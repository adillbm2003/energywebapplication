import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeading from '../../ui/SectionHeading'
import Button from '../../ui/Button'
import DetailModal from '../../ui/DetailModal'
import { CardSkeleton } from '../../ui/Skeleton'
import { energyAwarenessGuides } from '../../../data/energyGuides'
import { getGuideKeyGuidance } from '../../../utils/homeStats'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function EnergyAwarenessGuides({ stats, loading = false }) {
  const [selected, setSelected] = useState(null)
  return (
    <>
    <section className="section-padding bg-white" aria-labelledby="energy-guides-heading">
      <div className="container-page">
        <SectionHeading
          id="energy-guides-heading"
          title="National Energy Awareness Guides"
          subtitle="Official downloadable brochures and educational materials inspired by the Bermuda Government Energy Guide"
          align="center"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : energyAwarenessGuides.map((guide, index) => {
                const keyGuidance = getGuideKeyGuidance(stats, guide)


                return (
                  <motion.article
                    key={guide.id}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                    className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow transition-shadow hover:card-shadow-hover"
                  >
                    <div className="bg-[#2E5496] px-3 py-2.5 text-center">
                      <p className="text-caption font-semibold uppercase tracking-widest text-white">
                        {guide.categoryLabel}
                      </p>
                    </div>

                    <div className="flex flex-1 flex-col card-padding">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-h4 leading-snug">{guide.title}</h3>
                        <span className="text-xl leading-none" aria-hidden="true">
                          {guide.icon}
                        </span>
                      </div>

                      <div className="mt-4 rounded-lg border border-teal-100 bg-gradient-to-br from-teal-50/80 to-slate-50 p-3">
                        <p className="text-caption font-semibold uppercase tracking-wide text-teal-700">
                          Key Guidance
                        </p>
                        <p className="mt-1 text-h3 font-bold text-navy-900">{keyGuidance}</p>
                        <p className="mt-1 text-caption text-slate-600">{guide.guidanceNote}</p>
                      </div>

                      <p className="mt-4 flex-1 text-body-small text-slate-600">{guide.description}</p>

                      <div className="mt-5 space-y-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full uppercase tracking-wide"
                          onClick={() => setSelected({ guide, keyGuidance })}
                        >
                          View Details
                        </Button>
                        <Link
                          to={guide.learnMoreTo}
                          className="block text-center text-body-small font-semibold text-teal-700 transition-colors hover:text-teal-800"
                        >
                          Learn More
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
        </div>
      </div>
    </section>

    {selected && (
      <DetailModal
        isOpen
        onClose={() => setSelected(null)}
        title={`${selected.guide.icon} ${selected.guide.title}`}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Key Guidance</p>
            <p className="mt-1 text-2xl font-bold text-navy-900">{selected.keyGuidance}</p>
            <p className="mt-1 text-sm text-slate-600">{selected.guide.guidanceNote}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">About this Guide</p>
            <p className="text-sm text-slate-700 leading-relaxed">{selected.guide.description}</p>
          </div>
          <div className="pt-2">
            <Link
              to={selected.guide.learnMoreTo}
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
            >
              Explore Full Guide →
            </Link>
          </div>
        </div>
      </DetailModal>
    )}
    </>
  )
}
