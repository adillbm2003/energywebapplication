import { PAGE_IMAGES } from '../constants/branding'

export const consultations = [
  {
    id: 'con-001',
    title: 'Clean Energy Act Amendments 2026',
    summary:
      'Proposed amendments to strengthen grid interconnection standards, community solar provisions, and installer licensing requirements.',
    status: 'active',
    image: PAGE_IMAGES.solar,
    openingDate: '2026-04-01',
    closingDate: '2026-06-30',
    documents: [
      { title: 'Consultation Paper', url: '#', size: '1.8 MB' },
      { title: 'Draft Amendment Bill', url: '#', size: '420 KB' },
      { title: 'Impact Assessment', url: '#', size: '2.1 MB' },
    ],
  },
  {
    id: 'con-002',
    title: 'EV Charging Tariff Structure Review',
    summary:
      'Review of proposed tariff structures for public electric vehicle charging to ensure equitable access and grid stability.',
    status: 'active',
    image: PAGE_IMAGES.charging,
    openingDate: '2026-03-15',
    closingDate: '2026-05-31',
    documents: [
      { title: 'Discussion Paper', url: '#', size: '950 KB' },
      { title: 'Tariff Comparison Tables', url: '#', size: '180 KB' },
    ],
  },
  {
    id: 'con-003',
    title: 'Offshore Wind Development Framework',
    summary:
      'Stakeholder consultation on the regulatory and environmental framework for potential offshore wind development.',
    status: 'upcoming',
    image: PAGE_IMAGES.wind,
    openingDate: '2026-07-01',
    closingDate: '2026-09-30',
    documents: [
      { title: 'Pre-Consultation Brief', url: '#', size: '1.2 MB' },
    ],
  },
  {
    id: 'con-004',
    title: 'National Hydrogen Strategy',
    summary:
      'Public input sought on Bermuda\'s approach to hydrogen as a potential clean energy carrier for maritime and industrial applications.',
    status: 'upcoming',
    image: PAGE_IMAGES.grid,
    openingDate: '2026-08-01',
    closingDate: '2026-10-31',
    documents: [],
  },
  {
    id: 'con-005',
    title: 'Energy Efficiency Building Code 2025',
    summary:
      'Consultation on updated energy performance requirements for new construction and major renovations.',
    status: 'completed',
    image: PAGE_IMAGES.efficiency,
    openingDate: '2025-03-01',
    closingDate: '2025-06-30',
    documents: [
      { title: 'Consultation Summary Report', url: '#', size: '2.4 MB' },
      { title: 'Final Code Document', url: '#', size: '3.3 MB' },
    ],
  },
  {
    id: 'con-006',
    title: 'Community Solar Pilot Design',
    summary:
      'Design parameters and eligibility criteria for Bermuda\'s community solar pilot programme.',
    status: 'completed',
    image: PAGE_IMAGES.registry,
    openingDate: '2024-09-01',
    closingDate: '2024-12-15',
    documents: [
      { title: 'Consultation Response', url: '#', size: '1.1 MB' },
      { title: 'Pilot Programme Guidelines', url: '#', size: '780 KB' },
    ],
  },
]
