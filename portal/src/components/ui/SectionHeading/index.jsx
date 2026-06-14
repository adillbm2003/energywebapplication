export default function SectionHeading({ id, title, subtitle, align = 'left', className = '' }) {
  return (
    <div className={`mb-5 md:mb-6 ${align === 'center' ? 'text-center' : ''} ${className}`}>
      <div className={`${align === 'center' ? 'mx-auto' : ''} mb-2 h-1 w-10 rounded-full bg-gradient-to-r from-[#2E5496] to-teal-500`} aria-hidden="true" />
      <h2 id={id}>{title}</h2>
      {subtitle && (
        <p className={`mt-1.5 max-w-2xl text-body-small text-slate-600 ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
