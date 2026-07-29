import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from '../../ui/Badge'
import ProgressBar from '../../ui/ProgressBar'
import SafeImage from '../../common/SafeImage'
import { ROUTES } from '../../../constants/routes'
import { resolveProjectImage } from '../../../utils/contentImages'

export default function ProjectCard({ project }) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/80"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <SafeImage
          src={resolveProjectImage(project)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent opacity-60" aria-hidden="true" />
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <Badge variant="gold">{project.category}</Badge>
          <Badge status={project.status === 'Completed' ? 'Completed' : 'In Development'}>
            {project.status}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <h3 className="mb-1.5 leading-snug group-hover:text-teal-700 transition-colors duration-200">
          <Link to={ROUTES.projectDetail(project.id)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded">
            {project.title}
          </Link>
        </h3>

        <p className="mb-4 text-body-small text-slate-500 line-clamp-2 leading-relaxed">{project.summary}</p>

        <ProgressBar value={project.progress} label="Progress" />

        <div className="mt-4 border-t border-slate-100 pt-3">
          <Link
            to={ROUTES.projectDetail(project.id)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group/link"
          >
            View project
            <svg className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
