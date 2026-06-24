import { bursaryProgramme, bursaryFAQs, bursaryDocuments, bursaryRecipients } from '../data/bursary'
import { fetchMock, fetchFromAPI } from './api'

export const bursaryService = {
  getProgramme: () => fetchMock(bursaryProgramme),
  getFAQs: () => fetchMock(bursaryFAQs),
  getDocuments: () => fetchMock(bursaryDocuments),
  getRecipients: async () => {
    const items = await fetchFromAPI('/api/bursaries', bursaryRecipients)
    return items.map(r => ({
      id: r.id,
      name: r.name,
      school: r.school,
      fieldOfStudy: r.fieldOfStudy || r.field_of_study,
      academicYear: r.academicYear || r.academic_year,
      status: r.status,
      amount: r.amount,
      photoUrl: r.photoUrl || r.photo_url,
      bio: r.bio,
      achievement: r.achievement,
      focus: r.focus,
    }))
  },
}
