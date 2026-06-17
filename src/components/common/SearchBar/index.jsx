import Input from '../../ui/Input'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
  className = '',
  id = 'search',
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center" aria-hidden="true">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Input
          id={id}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-10"
          aria-label={label}
        />
      </div>
    </div>
  )
}
