import { EXTERNAL_LINKS } from '../constants/externalLinks'
import { PAGE_IMAGES } from '../constants/branding'

const RECIPIENT_IMAGES = [
  '/images/portraits/774909.jpg',
  '/images/portraits/2379004.jpg',
  '/images/portraits/1222271.jpg',
  '/images/portraits/1181686.jpg',
  '/images/portraits/1181519.jpg',
  '/images/portraits/91227.jpg',
]

export const bursaryProgramme = {
  title: 'Energy Bursary Programme',
  overview:
    'The Energy Bursary Programme supports Bermudian students pursuing post-secondary education in fields related to energy, renewable technology, engineering, and environmental sustainability.',
  eligibility: [
    'Bermudian status or permanent residency',
    'Enrollment in an accredited post-secondary institution',
    'Pursuing studies in energy, engineering, environmental science, or related fields',
    'Minimum GPA of 3.0 (or equivalent)',
    'Demonstrated commitment to Bermuda\'s energy transition',
  ],
  applicationDeadline: '2026-04-30',
  scholarshipLink: EXTERNAL_LINKS.scholarships,
  careerPathways: [
    'Renewable Energy', 'Electrical Engineering', 'Mechanical Engineering', 'Energy Policy',
    'Energy Regulation', 'Environmental Science', 'Sustainability', 'Climate Resilience',
    'Project Management', 'Data Analytics', 'GIS & Geospatial Technologies', 'Battery Energy Storage',
    'Electric Vehicle Infrastructure', 'Energy Efficiency', 'Public Sector Energy Planning',
    'Utility Operations', 'Emerging Technologies',
  ],
}

export const bursaryFAQs = [
  {
    question: 'Who is eligible to apply?',
    answer: 'Bermudian students and permanent residents enrolled in accredited post-secondary programmes in energy-related fields are eligible to apply.',
  },
  {
    question: 'Where do I submit my application?',
    answer: 'Applications are submitted through the official Bermuda Scholarships portal at bermudascholarships.bm. This website provides programme information and guidance only.',
  },
  {
    question: 'What does the bursary cover?',
    answer: 'Awards cover tuition, books, and related academic expenses up to a maximum of $15,000 per academic year, renewable for up to four years subject to academic performance.',
  },
  {
    question: 'When is the application deadline?',
    answer: 'Applications for the 2026–2027 academic year close on 30 April 2026.',
  },
]

export const bursaryDocuments = [
  { title: 'Programme Guidelines', url: EXTERNAL_LINKS.scholarships, size: 'External' },
  { title: 'Eligibility Criteria', url: EXTERNAL_LINKS.scholarships, size: 'External' },
  { title: 'Application Instructions', url: EXTERNAL_LINKS.scholarships, size: 'External' },
  { title: 'Required Document Checklist', url: EXTERNAL_LINKS.scholarships, size: 'External' },
  { title: 'FAQs', url: EXTERNAL_LINKS.scholarships, size: 'External' },
]

export const bursaryRecipients = [
  { id: 'rec-001', name: 'Alexandra Smith', field: 'Renewable Energy Engineering', institution: 'University of the West Indies', year: 2026, parish: 'Hamilton', quote: 'This bursary is helping me bring solar expertise back to Bermuda.', image: RECIPIENT_IMAGES[0] },
  { id: 'rec-002', name: 'Marcus Trott', field: 'Environmental Science', institution: 'McMaster University', year: 2026, parish: 'Warwick', quote: 'I hope to contribute to Bermuda\'s climate resilience goals.', image: RECIPIENT_IMAGES[1] },
  { id: 'rec-003', name: 'Sophia Outerbridge', field: 'Electrical Engineering', institution: 'University of British Columbia', year: 2026, parish: 'Pembroke', quote: 'Energy infrastructure is the future of our island.', image: RECIPIENT_IMAGES[2] },
  { id: 'rec-004', name: 'James Richardson', field: 'Sustainable Energy Systems', institution: 'University of Edinburgh', year: 2025, parish: 'Devonshire', quote: 'The programme opened doors I never thought possible.', image: RECIPIENT_IMAGES[3] },
  { id: 'rec-005', name: 'Emily Bean', field: 'Energy Policy', institution: 'London School of Economics', year: 2025, parish: 'St. George\'s', quote: 'Understanding policy is key to Bermuda\'s energy transition.', image: RECIPIENT_IMAGES[4] },
  { id: 'rec-006', name: 'David Flood', field: 'GIS & Geospatial Technologies', institution: 'University of Exeter', year: 2025, parish: 'Sandys', quote: 'Mapping renewable assets will help plan our clean energy future.', image: RECIPIENT_IMAGES[5] },
]

export const bursaryPathwayImages = {
  'Renewable Energy': PAGE_IMAGES.solar,
  'Electrical Engineering': PAGE_IMAGES.grid,
  'Mechanical Engineering': PAGE_IMAGES.energy,
  'Energy Policy': PAGE_IMAGES.government,
  'Energy Regulation': PAGE_IMAGES.consultation,
  'Environmental Science': PAGE_IMAGES.wind,
  'Sustainability': PAGE_IMAGES.solar,
  'Climate Resilience': PAGE_IMAGES.wind,
  'Project Management': PAGE_IMAGES.analytics,
  'Data Analytics': PAGE_IMAGES.analytics,
  'GIS & Geospatial Technologies': PAGE_IMAGES.innovation,
  'Battery Energy Storage': PAGE_IMAGES.battery,
  'Electric Vehicle Infrastructure': PAGE_IMAGES.charging,
  'Energy Efficiency': PAGE_IMAGES.efficiency,
  'Public Sector Energy Planning': PAGE_IMAGES.government,
  'Utility Operations': PAGE_IMAGES.grid,
  'Emerging Technologies': PAGE_IMAGES.innovation,
}
