import Select from '../../ui/Select'

export default function MapFilters({ parishes, types, parish, type, onParishChange, onTypeChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label="Parish"
        name="parish"
        value={parish}
        onChange={(e) => onParishChange(e.target.value)}
        options={[
          { value: 'all', label: 'All Parishes' },
          ...parishes.map((p) => ({ value: p, label: p })),
        ]}
      />
      <Select
        label="Installation Type"
        name="type"
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        options={[
          { value: 'all', label: 'All Types' },
          ...types.map((t) => ({ value: t, label: t })),
        ]}
      />
    </div>
  )
}
