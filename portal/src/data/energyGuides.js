import { ROUTES } from '../constants/routes'

// Set pdfUrl to the uploaded file path (e.g. '/uploads/solar-guide.pdf') when available.
// When null the button links to learnMoreTo instead of downloading.
export const energyAwarenessGuides = [
  {
    id: 'guide-ac',
    categoryLabel: 'Efficiency Standard',
    title: 'Air Conditioner Guide',
    icon: '❄️',
    statKey: null,
    staticKeyGuidance: '24°C (75°F)',
    guidanceNote: 'Every degree cooler increases power usage by 10%.',
    description:
      'Thermodynamic sizing, seasonal energy efficiency ratings (SEER), and maintenance guidance for residential and commercial cooling systems in Bermuda.',
    learnMoreTo: ROUTES.education,
    downloadTitle: 'Air Conditioner Guide',
    pdfUrl: null,
  },
  {
    id: 'guide-solar',
    categoryLabel: 'Deployment Rules',
    title: 'Solar Energy Guide',
    icon: '☀️',
    statKey: 'Installed Solar Capacity',
    staticKeyGuidance: 'Net Metering',
    guidanceNote: 'Guidelines on feed-in rates and grid interconnection requirements.',
    description:
      'Step-by-step guidance on solar PV sizing, finding a certified installer, net metering rules, and calculating return on investment for Bermuda properties.',
    learnMoreTo: ROUTES.installers,
    downloadTitle: 'Solar Energy Guide',
    pdfUrl: null,
  },
  {
    id: 'guide-efficiency',
    categoryLabel: 'Home Conservation',
    title: 'Energy Efficiency Guide',
    icon: '💡',
    statKey: 'Renewable Penetration',
    staticKeyGuidance: 'Energy Star',
    guidanceNote: 'Select energy-efficient appliances — washing machines, dryers, water heaters.',
    description:
      'Practical guidance to audit home energy loss, install LED lighting, reduce phantom load draws, and access Bermuda Government energy efficiency rebates.',
    learnMoreTo: ROUTES.education,
    downloadTitle: 'Home Energy Efficiency Guide',
    pdfUrl: null,
  },
]
