function extractTimestampFromId(id) {
  const match = String(id).match(/(\d{10,})/)
  return match ? Number(match[1]) : null
}

export function sortByNewest(items, dateFields = []) {
  if (!items?.length) return items ?? []

  const fields = dateFields.length
    ? dateFields
    : ['publishDate', 'publishedAt', 'effectiveDate', 'openingDate', 'startDate', 'lastUpdated', 'dateInitiated']

  return [...items].sort((a, b) => {
    for (const field of fields) {
      const aVal = a[field]
      const bVal = b[field]
      if (aVal && bVal) {
        const diff = new Date(bVal).getTime() - new Date(aVal).getTime()
        if (diff !== 0) return diff
      } else if (aVal && !bVal) {
        return -1
      } else if (!aVal && bVal) {
        return 1
      }
    }

    const aTime = extractTimestampFromId(a.id)
    const bTime = extractTimestampFromId(b.id)
    if (aTime && bTime && aTime !== bTime) return bTime - aTime

    return String(b.id ?? '').localeCompare(String(a.id ?? ''))
  })
}
