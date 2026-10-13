import { consultations } from '../data/consultations'
import { fetchFromAPI } from './api'
import { sortByNewest } from '../utils/sortContent'

// A consultation whose closing date has passed is not open, whatever the record
// says. The status field is set by hand, so "Space & Satellite Licensing & Fees"
// sat on the public site badged OPEN FOR SUBMISSIONS, with a live link inviting
// responses, for three months after it closed on 14 July 2026 -- nobody had been
// back to change it. The date is a fact about the consultation; the status field
// is only somebody's intention at the time they typed it, so the date wins.
//
// Applied here rather than in the pages, because getActive(), the consultations
// list and the home page all derive from this one mapping.
const hasClosed = (closingDate) => {
  if (!closingDate) return false
  const end = new Date(closingDate)
  if (Number.isNaN(end.getTime())) return false
  // Compare on whole days so a consultation stays open for the whole of its
  // closing day, in local time, rather than expiring at midnight UTC.
  const endOfClosingDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
  return Date.now() > endOfClosingDay.getTime()
}

export const consultationService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/consultations', consultations);
    return sortByNewest(items.map(c => {
      const closingDate = c.endDate || c.closingDate
      const recorded = c.status === 'Open' ? 'active' : (c.status === 'Closed' ? 'completed' : c.status || 'upcoming')
      return {
        id: c.id,
        title: c.title,
        summary: c.description || c.summary,
        // Never advertise a consultation as open past its closing date.
        status: recorded === 'active' && hasClosed(closingDate) ? 'completed' : recorded,
        openingDate: c.startDate || c.openingDate,
        closingDate,
        externalUrl: c.externalUrl || c.relatedLinks || null,
      }
    }), ['openingDate']);
  },
  getActive: async () => {
    const all = await consultationService.getAll();
    return all.filter((c) => c.status === 'active' || c.status === 'Open');
  },
}
