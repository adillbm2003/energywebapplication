import { ROUTES } from '../constants/routes'

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
      'Discover thermodynamic sizing parameters, seasonal energy efficiency ratings (SEER), and maintenance procedures.',
    learnMoreTo: ROUTES.education,
    downloadTitle: 'Air Conditioner Guide',
  },
  {
    id: 'guide-solar',
    categoryLabel: 'Deployment Rules',
    title: 'Solar Energy Guide',
    icon: '☀️',
    statKey: 'Installed Solar Capacity',
    staticKeyGuidance: 'Net Metering Rules',
    guidanceNote: 'Guidelines on feed-in rates and grid interconnection requirements.',
    description:
      'Step-by-step documentation on solar PV sizing, finding certified installers, and calculating return on investment.',
    learnMoreTo: ROUTES.installers,
    downloadTitle: 'Solar Energy Guide',
  },
  {
    id: 'guide-ev',
    categoryLabel: 'Public Safety',
    title: 'EV Charging Guide',
    icon: '🚗',
    statKey: 'Registered EVs',
    staticKeyGuidance: 'Class 2 Charging',
    guidanceNote: 'Safety checks required by the Planning Department for residences.',
    description:
      'Instructions on residential socket modifications, public charging networks mapping, and utility grid load balancing.',
    learnMoreTo: ROUTES.transitionDashboard,
    downloadTitle: 'EV Charging Guide',
  },
  {
    id: 'guide-efficiency',
    categoryLabel: 'Home Conservation',
    title: 'Energy Efficiency Guide',
    icon: '💡',
    statKey: 'Renewable Penetration',
    staticKeyGuidance: 'Energy Star Badge',
    guidanceNote: 'How to select energy-efficient washing machines, dryers, and water heaters.',
    description:
      'Practical guidelines to audit your home energy loss, install LED retrofit lighting, and reduce phantom load draws.',
    learnMoreTo: ROUTES.simulator,
    downloadTitle: 'Home Energy Efficiency Guide',
  },
]
