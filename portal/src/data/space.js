import { EXTERNAL_LINKS } from '../constants/externalLinks'
import { PAGE_IMAGES } from '../constants/branding'

// Content supplied by the Department of Energy ("Bermuda Space & Satellite
// Website Content", October 2026). It replaces the previous copy wholesale.
//
// The previous text described Bermuda as "the world's leading centre for space
// insurance and reinsurance", claimed an extension of the UK Outer Space Act and
// a "longstanding partnership with NASA and the European Space Agency", and
// listed investment and space-tourism opportunities. None of that appears in the
// supplied document, which describes the sector in terms of what the framework
// does rather than what the jurisdiction offers. The Space Insurance page was
// removed on the same instruction.
//
// Each page carries its own `disclaimer`, as the supplied document attaches one
// to every section.
const DISCLAIMER =
  'Information is provided for general informational purposes only and does not constitute legal, regulatory, technical, investment, or professional advice. Applicable requirements may change and users should consult relevant authorities regarding current requirements.'

export const spacePages = {
  'bermuda-global-space-economy': {
    title: 'Bermuda and the Global Space Economy',
    subtitle: 'Experience in satellite communications, satellite network filings, regulatory administration, and international business services',
    image: PAGE_IMAGES.spaceOrbit,
    content: [
      'Bermuda has developed a distinctive role within the global space economy through its experience in satellite communications, satellite network filings, regulatory administration, and international business services.',
      'As space and satellite activities continue to evolve, Bermuda supports the sector through a stable regulatory environment, international engagement, and policies that encourage responsible development and innovation.',
    ],
    sections: [
      {
        heading: 'Bermuda\'s Role in Satellite Communications',
        paragraphs: [
          'Bermuda has a long-standing association with the international satellite sector and has developed experience in satellite network filing and regulatory administration.',
          'Operating within the framework established by the International Telecommunication Union (ITU), Bermuda participates in international processes relating to satellite networks and associated spectrum resources. The Department of Energy is responsible for policy matters relating to the space and satellite sector and supports activities associated with satellite network filings through Bermuda.',
          'Bermuda\'s location in the North Atlantic and established telecommunications infrastructure contribute to its role in supporting international communications services and related satellite activities.',
        ],
      },
      {
        heading: 'International Engagement',
        paragraphs: [
          'The Government of Bermuda engages with international organizations, industry participants, and other stakeholders on matters relating to the space and satellite sector.',
          'Through participation in international regulatory processes and ongoing stakeholder engagement, Bermuda seeks to maintain a policy framework that reflects evolving industry developments and international best practices.',
        ],
      },
      {
        heading: 'Sector Development',
        paragraphs: [
          'The Government of Bermuda supports the responsible development of space and satellite-related activities within the jurisdiction through policy development, stakeholder engagement, and participation in relevant international regulatory processes.',
          'Bermuda\'s regulatory and professional services environment supports organizations seeking information about the space and satellite sector and applicable regulatory requirements.',
        ],
      },
    ],
    disclaimer: DISCLAIMER,
    highlights: [
      'Satellite communications experience',
      'Satellite network filings',
      'ITU regulatory framework',
      'Regulatory administration',
      'International engagement',
    ],
    crossLinks: [
      { label: 'Why Choose Bermuda', to: '/space-satellite/why-choose-bermuda' },
      { label: 'Earth Stations & Operations', to: '/space-satellite/earth-stations-operations' },
      { label: 'Satellite Filing & Guidance', to: '/space-satellite/satellite-filing-guidance' },
    ],
  },

  'why-choose-bermuda': {
    title: 'Why Choose Bermuda',
    subtitle: 'Strategic location, regulatory expertise, and political stability supporting space and satellite sector activities',
    image: PAGE_IMAGES.spaceWhyBermuda,
    content: [
      'Bermuda offers a combination of strategic location, regulatory expertise, and political stability that supports space and satellite sector activities. Supported by a framework for satellite network filings and spectrum administration, Bermuda provides a stable regulatory and legal environment relevant to space and satellite activities.',
    ],
    sections: [
      {
        heading: 'Strategic Geographic Location',
        paragraphs: [
          'Situated in the western North Atlantic, approximately 1,070 kilometres east of the United States coastline, Bermuda occupies a strategic position between North America and Europe. The island\'s location provides visibility to a broad portion of the geostationary orbital arc, supporting satellite communications and related ground infrastructure serving international markets.',
          'Bermuda\'s mid-Atlantic position also offers value for operators seeking geographic diversity within their communications networks and ground infrastructure.',
        ],
      },
      {
        heading: 'Business and Regulatory Environment',
        paragraphs: [
          'As a British Overseas Territory, Bermuda offers a common law legal system, political stability, and a transparent regulatory environment.',
          'The Regulatory Authority of Bermuda oversees electronic communications, including spectrum licensing, while the Department of Energy coordinates space and satellite policy and matters relating to satellite network filings under the framework of the International Telecommunication Union (ITU).',
          'Bermuda has developed established experience in satellite network filing administration and continues to engage with international stakeholders on matters relating to space and satellite activities.',
        ],
      },
    ],
    disclaimer: DISCLAIMER,
    highlights: [
      'Western North Atlantic location',
      'Visibility to a broad portion of the geostationary arc',
      'British Overseas Territory',
      'Common law legal system',
      'Transparent regulatory environment',
    ],
    crossLinks: [
      { label: 'Earth Stations & Operations', to: '/space-satellite/earth-stations-operations' },
      { label: 'Satellite Filing & Guidance', to: '/space-satellite/satellite-filing-guidance' },
      { label: 'Sector Enquiries', to: '/space-satellite/sector-enquiries' },
    ],
  },

  'earth-stations-operations': {
    title: 'Earth Stations and Satellite Operations',
    subtitle: 'Telecommunications infrastructure and the regulatory framework for earth station licensing',
    image: PAGE_IMAGES.spaceDish,
    content: [
      'Bermuda supports satellite communications through its telecommunications infrastructure and regulatory framework for earth station licensing.',
    ],
    sections: [
      {
        heading: 'Licensing Earth Stations in Bermuda',
        paragraphs: [
          'The Regulatory Authority of Bermuda (RA) is responsible for the licensing of earth stations and the management of radio frequency spectrum in Bermuda in accordance with applicable legislation and regulatory requirements.',
          'Applicants may be required to submit technical, operational, and other information to support regulatory review. Additional approvals or coordination processes may apply depending on the nature of the proposed operation.',
          'The Department of Energy is responsible for policy matters relating to the space and satellite sector and may engage, where appropriate, on matters relating to international obligations and satellite network filings.',
        ],
      },
      {
        heading: 'Enquiries Regarding Earth Station Development',
        paragraphs: [
          'Organizations interested in establishing or operating earth station facilities in Bermuda are encouraged to contact the Department of Energy and the Regulatory Authority of Bermuda to discuss applicable regulatory, policy, and licensing considerations.',
        ],
      },
    ],
    disclaimer: DISCLAIMER,
    highlights: [
      'Earth station licensing by the Regulatory Authority',
      'Radio frequency spectrum management',
      'Technical and operational information for review',
      'Department of Energy policy engagement',
    ],
    crossLinks: [
      { label: 'Satellite Filing & Guidance', to: '/space-satellite/satellite-filing-guidance' },
      { label: 'Sector Enquiries', to: '/space-satellite/sector-enquiries' },
    ],
  },

  'satellite-filing-guidance': {
    title: 'Satellite Filing and Regulatory Guidance',
    subtitle: 'Participation in international satellite regulatory processes through the ITU framework',
    image: PAGE_IMAGES.spaceNightsky,
    content: [
      'Bermuda participates in international satellite regulatory processes through the framework of the International Telecommunication Union (ITU).',
    ],
    sections: [
      {
        heading: 'Overview of ITU Satellite Filings',
        paragraphs: [
          'The ITU Radio Regulations establish the international framework for the coordination, notification, and registration of satellite networks and associated frequency assignments.',
          'Satellite operators seeking to deploy satellite networks may be required to follow applicable ITU procedures and coordination processes. Bermuda may facilitate satellite network filings in accordance with applicable legislation, policies, and international obligations.',
        ],
      },
    ],
    disclaimer: DISCLAIMER,
    highlights: [
      'ITU Radio Regulations',
      'Coordination, notification, and registration',
      'Frequency assignments',
      'Filings under applicable legislation and policy',
    ],
    crossLinks: [
      { label: 'Earth Stations & Operations', to: '/space-satellite/earth-stations-operations' },
      { label: 'National Space Strategy', to: '/space-satellite/national-space-strategy' },
      { label: 'Sector Enquiries', to: '/space-satellite/sector-enquiries' },
    ],
  },

  'national-space-strategy': {
    title: 'National Space Strategy and Policy Documents',
    subtitle: 'Policies and initiatives supporting the responsible development of space-related activities',
    image: PAGE_IMAGES.spaceStrategy,
    content: [
      'Bermuda\'s space and satellite sector is guided by policies and initiatives intended to support the responsible development of space-related activities within the jurisdiction.',
    ],
    sections: [
      {
        heading: 'National Space Strategy',
        paragraphs: [
          'The National Space Strategy sets out the Government\'s objectives for the development of Bermuda\'s space and satellite sector.',
        ],
      },
      {
        heading: 'Policy and Consultation Documents',
        paragraphs: [
          'The Government may periodically publish consultation papers, policy documents, and other materials relating to the space and satellite sector.',
        ],
      },
      {
        heading: 'Space Education and STEM Initiatives',
        paragraphs: [
          'The Government supports educational initiatives that promote interest in science, technology, engineering, and mathematics (STEM) and encourage awareness of space-related fields among students and young professionals.',
        ],
      },
    ],
    disclaimer: DISCLAIMER,
    // The "National Space Strategy 2020-2025" entry that used to sit here had
    // url: '#' and a 3.4 MB file size, so it rendered as a downloadable PDF and
    // produced a placeholder document when clicked. The strategy is described
    // above; only the live consultations forum is linked.
    documents: [
      { title: 'Space & Satellite Consultation', url: EXTERNAL_LINKS.consultationsForum, size: 'External' },
    ],
    highlights: [
      'National Space Strategy',
      'Consultation papers and policy documents',
      'STEM education initiatives',
    ],
    crossLinks: [
      { label: 'Bermuda & Global Space Economy', to: '/space-satellite/bermuda-global-space-economy' },
      { label: 'Satellite Filing & Guidance', to: '/space-satellite/satellite-filing-guidance' },
      { label: 'Sector Enquiries', to: '/space-satellite/sector-enquiries' },
    ],
  },

  'sector-enquiries': {
    title: 'Space Sector Enquiries',
    subtitle: 'A point of contact for space and satellite policy, satellite network filings, and other space-sector matters',
    image: PAGE_IMAGES.spaceAstronaut,
    content: [
      'The Department of Energy serves as a point of contact for enquiries relating to space and satellite policy, satellite network filings, and other space-sector matters within Bermuda.',
    ],
    disclaimer: DISCLAIMER,
    contact: {
      email: 'energy@gov.bm',
      phone: '441-444-0597',
      address: 'Department of Energy, Government Administration Building, 30 Parliament Street, Hamilton HM 12, Bermuda',
      hours: 'Monday – Friday, 9:00 AM – 5:00 PM',
    },
    highlights: [
      'Space and satellite policy',
      'Satellite network filings',
      'Other space-sector matters',
    ],
    crossLinks: [
      { label: 'Bermuda & Global Space Economy', to: '/space-satellite/bermuda-global-space-economy' },
      { label: 'Earth Stations & Operations', to: '/space-satellite/earth-stations-operations' },
    ],
  },
}
