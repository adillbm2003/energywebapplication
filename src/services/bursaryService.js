import { bursaryProgramme, bursaryFAQs, bursaryDocuments, bursaryRecipients } from '../data/bursary'
import { fetchFromAPI, fetchMock } from './api'

export const bursaryService = {
  getProgramme: () => fetchMock(bursaryProgramme),
  getFAQs: () => fetchMock(bursaryFAQs),
  getDocuments: () => fetchMock(bursaryDocuments),
  getRecipients: async () => {
    const items = await fetchFromAPI('/api/bursaries', bursaryRecipients)
    return items.map(b => ({
      id: b.id,
      name: b.name,
      school: b.school,
      fieldOfStudy: b.fieldOfStudy || b.field_of_study,
      academicYear: b.academicYear || b.academic_year,
      status: b.status || 'Active',
      amount: b.amount,
      photoUrl: b.photoUrl || b.photo_url,
      guidelinesUrl: b.guidelinesUrl || b.guidelines_url,
      bio: b.bio,
    }))
  },
}
