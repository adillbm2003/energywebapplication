import { PAGE_IMAGES } from '../constants/branding'

export const news = [
  {
    id: '1',
    slug: 'bermuda-renewable-energy-milestone',
    title: 'Bermuda Reaches New Renewable Energy Milestone',
    excerpt:
      'Installed solar capacity across the island has surpassed 25 MW, marking significant progress toward Bermuda\'s 2030 energy targets.',
    category: 'Renewable Energy',
    featured: true,
    author: 'Department of Energy',
    publishedAt: '2026-05-15',
    image: PAGE_IMAGES.solarFieldBermuda,
    content: [
      'The Department of Energy is pleased to announce that Bermuda has surpassed 25 megawatts of installed solar photovoltaic capacity across residential, commercial, and utility-scale installations.',
      'This achievement reflects sustained investment in distributed generation, supportive regulatory frameworks, and growing public awareness of the benefits of renewable energy.',
      'The milestone supports Bermuda\'s Integrated Resource Plan targets and demonstrates the island\'s commitment to a cleaner, more resilient energy future.',
    ],
  },
  {
    id: '2',
    slug: 'ev-charging-infrastructure-expansion',
    title: 'EV Charging Infrastructure Expansion Announced',
    excerpt:
      'Government announces new public charging locations across Hamilton, St. George\'s, and the western parishes to support electric vehicle adoption.',
    category: 'Transport',
    featured: true,
    author: 'Department of Energy',
    publishedAt: '2026-04-28',
    image: PAGE_IMAGES.electricBus,
    content: [
      'A coordinated expansion of electric vehicle charging infrastructure will see new fast-charging stations installed at key locations across Bermuda.',
      'The initiative supports the Energy Transition Dashboard goals and aims to reduce range anxiety for residents considering the switch to electric mobility.',
    ],
  },
  {
    id: '3',
    slug: 'public-consultation-clean-energy-act',
    title: 'Public Consultation Opens on Clean Energy Act Amendments',
    excerpt:
      'Stakeholders are invited to provide feedback on proposed amendments to strengthen Bermuda\'s clean energy regulatory framework.',
    category: 'Policy',
    featured: false,
    author: 'Department of Energy',
    publishedAt: '2026-04-10',
    image: PAGE_IMAGES.consultation,
    content: [
      'The Department of Energy has published proposed amendments to the Clean Energy Act for public consultation.',
      'The amendments address grid interconnection standards, community solar provisions, and updated licensing requirements for renewable energy installers.',
    ],
  },
  {
    id: '4',
    slug: 'energy-bursary-2026-recipients',
    title: '2026 Energy Bursary Recipients Announced',
    excerpt:
      'Twelve Bermudian students receive scholarships to pursue studies in renewable energy, engineering, and sustainability.',
    category: 'Education',
    featured: false,
    author: 'Department of Energy',
    publishedAt: '2026-03-22',
    image: PAGE_IMAGES.educationOutreach,
    content: [
      'The Energy Bursary Programme has awarded scholarships to twelve outstanding Bermudian students for the 2026 academic year.',
      'Recipients will pursue degrees in engineering, environmental science, and renewable energy technology at accredited institutions.',
    ],
  },
  {
    id: '5',
    slug: 'space-satellite-sector-report',
    title: 'Bermuda Space & Satellite Sector Annual Report Published',
    excerpt:
      'The latest annual report highlights growth in satellite filing services, earth station operations, and STEM workforce development.',
    category: 'Space',
    featured: false,
    author: 'Department of Energy',
    publishedAt: '2026-03-05',
    image: PAGE_IMAGES.satellite,
    content: [
      'Bermuda continues to strengthen its position as a leading jurisdiction for space and satellite services.',
      'The annual report documents regulatory milestones, industry partnerships, and educational initiatives supporting the national space strategy.',
    ],
  },
  {
    id: '6',
    slug: 'community-solar-pilot-launch',
    title: 'Community Solar Pilot Programme Launches',
    excerpt:
      'A new pilot enables residents without suitable rooftops to participate in shared solar generation projects.',
    category: 'Renewable Energy',
    featured: false,
    author: 'Department of Energy',
    publishedAt: '2026-02-18',
    image: PAGE_IMAGES.bhcHousing,
    content: [
      'The Community Solar Pilot Programme allows eligible residents and small businesses to subscribe to shared solar installations.',
      'Participants receive credits on their electricity bills proportional to their subscription, expanding access to renewable energy benefits.',
    ],
  },
]
