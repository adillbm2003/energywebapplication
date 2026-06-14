/**
 * Triggers a client-side download for mock policy/publication documents.
 * Used until backend document storage is integrated.
 */
export function downloadMockDocument({ title, summary = '', category = 'Publication' }) {
  const divider = '='.repeat(Math.min(title.length, 72))
  const content = [
    title,
    divider,
    '',
    'Department of Energy',
    'Government of Bermuda',
    'https://energy.bm',
    '',
    `Category: ${category}`,
    '',
    summary,
    '',
    '---',
    'This is a demonstration placeholder document for the energy.bm frontend prototype.',
    'Official publications are available through the Department of Energy.',
  ].join('\n')

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 72)}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function isExternalUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:'))
}
