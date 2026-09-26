import { motion } from 'framer-motion'

export default function ContentBlock({
  title,
  subtitle,
  children,
  image,
  imageAlt = '',
  // A photographer credit, where the licence on the image requires one to be
  // shown. Left off, nothing is rendered.
  imageCredit = null,
  reverse = false,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`grid items-center gap-5 lg:grid-cols-2 lg:gap-8 ${className}`}
    >
      <div className={reverse ? 'lg:order-2' : ''}>
        {title && <h2>{title}</h2>}
        {subtitle && <p className="mt-2 text-body-small text-slate-600">{subtitle}</p>}
        <div className="mt-3 text-slate-600">{children}</div>
      </div>
      {image && (
        <figure className={`m-0 ${reverse ? 'lg:order-1' : ''}`}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 card-shadow">
            <img src={image} alt={imageAlt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
          </div>
          {imageCredit && (
            <figcaption className="mt-2 text-caption text-slate-500">{imageCredit}</figcaption>
          )}
        </figure>
      )}
    </motion.div>
  )
}
