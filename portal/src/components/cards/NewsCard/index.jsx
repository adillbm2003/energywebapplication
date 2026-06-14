import { Link } from 'react-router-dom'

import { motion } from 'framer-motion'

import Badge from '../../ui/Badge'

import SafeImage from '../../common/SafeImage'

import { formatDate } from '../../../utils/format'

import { ROUTES } from '../../../constants/routes'

import { resolveNewsImage } from '../../../utils/contentImages'



export default function NewsCard({ article }) {

  return (

    <motion.article

      whileHover={{ y: -4 }}

      transition={{ duration: 0.2 }}

      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow transition-shadow hover:card-shadow-hover"

    >

      <div className="aspect-[16/10] overflow-hidden">

        <SafeImage

          src={resolveNewsImage(article)}

          alt=""

          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"

        />

      </div>

      <div className="flex flex-1 flex-col card-padding">

        <div className="mb-1.5 flex items-center gap-2">

          <Badge>{article.category}</Badge>

          <time className="text-caption text-slate-500" dateTime={article.publishedAt}>

            {formatDate(article.publishedAt)}

          </time>

        </div>

        <h3 className="mb-1.5 group-hover:text-teal-700 transition-colors">

          <Link to={ROUTES.newsArticle(article.slug)}>{article.title}</Link>

        </h3>

        <p className="flex-1 text-body-small text-slate-600 line-clamp-3">{article.excerpt}</p>

        <Link

          to={ROUTES.newsArticle(article.slug)}

          className="mt-3 text-body-small font-semibold text-teal-600 hover:text-teal-700"

          aria-label={`Read more: ${article.title}`}

        >

          Read more →

        </Link>

      </div>

    </motion.article>

  )

}

