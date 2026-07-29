export default function SectionHeading({ title, subtitle, align = 'left', className = '', id, eyebrow }) {
  return (
    <div className={`mb-6 md:mb-8 ${align === 'center' ? 'text-center' : ''} ${className}`}>
      {eyebrow && (
        <p className={`mb-2 text-xs font-bold uppercase tracking-widest text-teal-600 ${align === 'center' ? 'mx-auto' : ''}`}>
          {eyebrow}
        </p>
      )}
      <h2 id={id}>{title}</h2>
      {subtitle && (
        <p className={`mt-2 max-w-2xl text-body-small text-slate-500 leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
