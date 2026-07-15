import { EXTERNAL_LINKS } from '../constants/externalLinks'
import { PAGE_IMAGES } from '../constants/branding'

export const spacePages = {
  'bermuda-global-space-economy': {
    title: 'Bermuda and the Global Space Economy',
    subtitle: 'Gateway to the global space economy',
    image: PAGE_IMAGES.space,
    content: [
      'Bermuda has established itself as a leading international centre for space and satellite communications, leveraging its strategic mid-Atlantic location, robust regulatory framework, and deep expertise in telecommunications.',
      'This page introduces Bermuda as a gateway to the global space economy and explains why the island is well positioned for space and satellite sector development.',
    ],
    highlights: ['Mid-Atlantic gateway', 'Regulatory expertise', 'International partnerships', 'Innovation ecosystem'],
  },
  'why-choose-bermuda': {
    title: 'Why Choose Bermuda',
    subtitle: 'Competitive advantages for space industry investment',
    image: PAGE_IMAGES.bermuda,
    content: [
      'Bermuda offers political stability, regulatory sophistication, and proximity to major North American and European markets.',
      'The jurisdiction provides efficient licensing, access to skilled professionals, and a supportive government committed to growing the space economy.',
    ],
    highlights: ['Strategic mid-Atlantic location', 'Earth station opportunities', 'Satellite filing support', 'Insurance & financial services', 'Regulatory environment'],
  },
  'earth-stations-operations': {
    title: 'Earth Stations and Satellite Operations',
    subtitle: 'World-class ground segment infrastructure',
    image: PAGE_IMAGES.space,
    content: [
      'Bermuda hosts earth station facilities providing telemetry, tracking, and control services for satellite operators worldwide.',
      'Opportunities exist for establishing earth stations supporting satellite communications, launch monitoring, oceanic tracking, maritime and aviation services.',
    ],
    highlights: ['TT&C services', 'Launch monitoring', 'Oceanic tracking', 'Maritime & aviation networks'],
    relatedArticles: [
      { title: 'Public invited to review space and satellite proposals', url: 'https://www.royalgazette.com/general/news/article/20260518/public-invited-to-review-space-and-satellite-proposals/', date: '2026-05-18', source: 'Royal Gazette' },
    ],
  },
  'satellite-filing-guidance': {
    title: 'Satellite Filing and Regulatory Guidance',
    subtitle: 'Efficient, transparent ITU filing process',
    image: PAGE_IMAGES.space,
    content: [
      'Bermuda administers satellite filing obligations with the International Telecommunication Union (ITU), providing coordination services for operators registering satellite networks.',
      'The process is designed to be efficient, transparent and compliant with applicable international requirements, including administrative fees and coordination with relevant regulatory bodies.',
    ],
    highlights: ['ITU coordination', 'Administrative fees', 'International compliance', 'Dedicated contacts'],
  },
  'space-insurance': {
    title: 'Space Insurance',
    subtitle: 'World-leading insurance and reinsurance jurisdiction',
    image: PAGE_IMAGES.government,
    content: [
      'Bermuda is recognised as the world\'s leading market for space insurance, with decades of experience underwriting launch, in-orbit, and third-party liability risks.',
      'Opportunities exist for space-related insurance products covering satellites, launches, space assets, and related risks.',
    ],
    highlights: ['Global market leader', 'Launch & in-orbit coverage', 'Reinsurance expertise', 'Regulatory support'],
  },
  'national-space-strategy': {
    title: 'National Space Strategy and Consultation Documents',
    subtitle: 'Policy framework and public consultation materials',
    image: PAGE_IMAGES.consultation,
    content: [
      'Access Bermuda\'s National Space Strategy 2020–2025, space and satellite consultation documents, related policy papers, and public notices.',
      'The Space & Satellite consultation document is also available through the Government consultations forum.',
    ],
    highlights: ['National Space Strategy 2020–2025', 'Consultation documents', 'Policy papers', 'Public notices'],
    documents: [
      { title: 'National Space Strategy 2020–2025', url: '#', size: '3.4 MB' },
      { title: 'Space & Satellite Consultation', url: EXTERNAL_LINKS.consultationsForum, size: 'External' },
    ],
  },
  'stem-workforce': {
    title: 'Space Camps, STEM Education and Workforce Pathways',
    subtitle: 'Building Bermuda\'s space workforce',
    image: PAGE_IMAGES.education,
    content: [
      'The Department supports space camps, STEM education, student programmes, workshops, small satellite programmes, and microgravity experiments.',
      'Detailed student and public education resources are available in the Education Centre to avoid duplication across sections.',
    ],
    highlights: ['Space camps', 'STEM programmes', 'Small satellite projects', 'Career pathways'],
    crossLinks: [{ label: 'Education Centre', to: '/education' }],
  },
  'sector-enquiries': {
    title: 'Contact and Sector Enquiries',
    subtitle: 'Connect with the Space & Satellite team',
    image: PAGE_IMAGES.contact,
    content: [
      'For inquiries related to satellite filing, earth station licensing, space insurance, investment opportunities, or STEM programmes, contact the Space & Satellite Division.',
    ],
    contact: {
      email: 'space@gov.bm',
      phone: '+1 (441) 444-0597',
      address: 'Department of Energy, Government Administration Building, 30 Parliament Street, Hamilton HM 12, Bermuda',
    },
  },
}
