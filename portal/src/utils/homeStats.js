export function findHomeStat(stats, label) {
  return stats?.find((stat) => stat.label === label)
}

export function formatHomeStatDisplay(stat) {
  if (!stat) return null
  const value = stat.value ?? ''
  const unit = stat.unit ?? ''
  return unit ? `${value} ${unit}`.trim() : String(value)
}

export function getGuideKeyGuidance(stats, { statKey, staticKeyGuidance }) {
  if (statKey) {
    const stat = findHomeStat(stats, statKey)
    const dynamic = formatHomeStatDisplay(stat)
    if (dynamic) return dynamic
  }
  return staticKeyGuidance ?? '—'
}
