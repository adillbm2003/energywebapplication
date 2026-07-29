export function filterBySearch(items, query, fields = ['title']) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return items

  return items.filter((item) =>
    fields.some((field) => {
      const value = field.split('.').reduce((acc, key) => acc?.[key], item)
      return String(value ?? '')
        .toLowerCase()
        .includes(normalized)
    }),
  )
}

export function filterByField(items, field, value) {
  if (!value || value === 'all') return items
  return items.filter((item) => item[field] === value)
}

export function sortItems(items, sortBy, direction = 'asc') {
  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]

    if (aVal === bVal) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal
    }

    return String(aVal).localeCompare(String(bVal))
  })

  return direction === 'desc' ? sorted.reverse() : sorted
}
