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

      whileHover={{ y: -4 }}

      transition={{ duration: 0.2 }}

      className="group overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow transition-shadow hover:card-shadow-hover"

    >

      <div className="aspect-[16/9] overflow-hidden">

        <SafeImage

          src={resolveProjectImage(project)}

          alt=""

          className="h-full w-full object-cover transition-transform group-hover:scale-105"

        />

      </div>

      <div className="card-padding">

        <div className="mb-1.5 flex items-center gap-2">

          <Badge variant="gold">{project.category}</Badge>

          <Badge status={project.status === 'Completed' ? 'Completed' : 'In Development'}>

            {project.status}

          </Badge>

        </div>

        <h3 className="mb-1.5">

          <Link to={ROUTES.projectDetail(project.id)} className="hover:text-teal-700 transition-colors">

            {project.title}

          </Link>

        </h3>

        <p className="mb-3 text-body-small text-slate-600 line-clamp-2">{project.summary}</p>

        <ProgressBar value={project.progress} label="Progress" />

        <Link

          to={ROUTES.projectDetail(project.id)}

          className="mt-3 inline-block text-body-small font-semibold text-teal-600 hover:text-teal-700"

        >

          View project →

        </Link>

      </div>

    </motion.article>

  )

}

