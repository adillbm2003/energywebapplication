import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-600 shadow-sm shadow-teal-900/20',
  secondary: 'bg-[#2E5496] text-white hover:bg-[#244475] focus-visible:ring-[#2E5496] shadow-sm',
  outline: 'border-2 border-teal-600 text-teal-700 hover:bg-teal-50 focus-visible:ring-teal-600',
  ghost: 'text-navy-800 hover:bg-slate-100 focus-visible:ring-slate-400',
  gold: 'bg-gold-500 text-navy-900 hover:bg-gold-400 focus-visible:ring-gold-500 shadow-sm',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm font-semibold',
  lg: 'px-6 py-3 text-base font-semibold',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className,
  disabled,
  type = 'button',
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  )

  if (to) {
    const linkProps = { ...props }
    delete linkProps.target
    delete linkProps.rel
    return (
      <Link to={to} className={classes} {...linkProps}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
