// Mock consultation data. Real data is fetched from /api/consultations.
// All consultations link to the Government Citizens Forum for submissions.

export const consultations = [
  {
    id: 'con-nesp-2026',
    title: 'National Energy Security Policy (NESP) 2026',
    description:
      "Public consultation on Bermuda's updated National Energy Security Policy, covering renewable energy targets, grid resilience, and energy affordability for 2026–2030.",
    status: 'Open',
    openingDate: '2026-05-01',
    closingDate: '2026-07-31',
    externalUrl: 'https://forum.gov.bm/en/',
    relatedArticles: [
      { title: 'Updating energy policy requires holistic approach, forum hears', url: 'https://www.royalgazette.com/general/news/article/20260519/updating-energy-policy-requires-holistic-approach-forum-hears/', date: '2026-05-19', source: 'Royal Gazette' },
      { title: 'Proposed changes to electricity sector open for consultation', url: 'https://www.royalgazette.com/environment/news/article/20260416/proposed-changes-to-electricity-sector-open-for-consultation/', date: '2026-04-16', source: 'Royal Gazette' },
    ],
  },
  {
    id: 'con-001',
    title: 'Clean Energy Act Amendments 2026',
    description:
      'Proposed amendments to strengthen grid interconnection standards, community solar provisions, and installer licensing requirements.',
    status: 'Open',
    openingDate: '2026-04-01',
    closingDate: '2026-06-30',
    externalUrl: 'https://forum.gov.bm/en/',
  },
  {
    id: 'con-003',
    title: 'Energy Efficiency Building Code 2025',
    description:
      'Consultation on updated energy performance requirements for new construction and major renovations.',
    status: 'Closed',
    openingDate: '2025-03-01',
    closingDate: '2025-06-30',
    externalUrl: 'https://forum.gov.bm/en/',
  },
  {
    id: 'con-004',
    title: 'Community Solar Pilot Design',
    description:
      'Design parameters and eligibility criteria for Bermuda\'s community solar pilot programme.',
    status: 'Closed',
    openingDate: '2024-09-01',
    closingDate: '2024-12-15',
    externalUrl: 'https://forum.gov.bm/en/',
  },
]
