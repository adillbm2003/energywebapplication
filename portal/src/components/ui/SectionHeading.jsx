export default function SectionHeading({ title, subtitle, align = 'left', className = '' }) {
  return (
    <div className={`mb-5 md:mb-6 ${align === 'center' ? 'text-center' : ''} ${className}`}>
      <h2>{title}</h2>
      {subtitle && (
        <p className={`mt-1.5 max-w-2xl text-body-small text-slate-600 ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
