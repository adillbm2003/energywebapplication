import { bursaryProgramme, bursaryFAQs, bursaryDocuments, bursaryRecipients } from '../data/bursary'
import { fetchMock } from './api'

export const bursaryService = {
  getProgramme: () => fetchMock(bursaryProgramme),
  getFAQs: () => fetchMock(bursaryFAQs),
  getDocuments: () => fetchMock(bursaryDocuments),
  getRecipients: () => fetchMock(bursaryRecipients),
}
