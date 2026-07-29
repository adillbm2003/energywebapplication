import Select from '../../ui/Select'

export default function DashboardFilters({ year, onYearChange, years = [] }) {
  const options = [
    { value: 'all', label: 'All Years' },
    ...years.map((y) => ({ value: String(y), label: String(y) })),
  ]

  return (
    <div className="flex flex-wrap items-end gap-4">
      <Select
        label="Time Period"
        name="year"
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        options={options}
        className="w-48"
      />
    </div>
  )
}
