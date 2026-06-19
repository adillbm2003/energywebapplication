import { fetchFromAPI } from './api'

const STATIC_RECIPIENTS = [
  {
    id: 'bur-001',
    name: 'Neriah Bean',
    school: 'Oakwood University',
    fieldOfStudy: 'Bachelor of Science in Applied Mathematics and Engineering',
    academicYear: '2025',
    photoUrl: '/images/portraits/neriah-bean.jpg',
    achievement: "Selected for his strong academic record, leadership potential, and an essay analysing Bermuda's energy future and the public's role in it.",
    focus: 'Developing foundational engineering and mathematical expertise to contribute to climate resilience and clean energy transformation.',
    status: 'Active',
  },
  {
    id: 'bur-002',
    name: 'Benjamin Crofton',
    school: 'Virginia Tech · Alumnus of Somersfield Academy, Bermuda',
    fieldOfStudy: 'Bachelor of Science in Mechanical Engineering',
    academicYear: '2025',
    photoUrl: '/images/portraits/benjamin-crofton.jpg',
    achievement: "Awarded for his technical acumen and analytical essay on Bermuda's energy transition.",
    focus: 'Acquiring hands-on mechanical engineering insights to support independent energy infrastructure and modern technical planning on the island.',
    status: 'Active',
  },
]

export const bursaryRecipientsService = {
  getAll: async () => {
    const items = await fetchFromAPI('/api/bursaries', STATIC_RECIPIENTS)
    return items
      .filter(r => (r.status || 'Active') === 'Active')
      .map(r => ({
        id: r.id,
        name: r.name,
        school: r.school || r.fieldOfStudy,
        fieldOfStudy: r.fieldOfStudy || r.field_of_study,
        academicYear: r.academicYear || r.academic_year,
        photoUrl: r.photoUrl || r.photo_url || '/images/portrait.jpg',
        achievement: r.achievement || r.bio || '',
        focus: r.focus || '',
        status: r.status,
      }))
  },
}
