import { EXTERNAL_LINKS } from '../constants/externalLinks'
import { PAGE_IMAGES } from '../constants/branding'

export const spacePages = {
  'bermuda-global-space-economy': {
    title: 'Bermuda and the Global Space Economy',
    subtitle: 'A strategic mid-Atlantic jurisdiction at the centre of the global space and satellite industry',
    image: PAGE_IMAGES.spaceOrbit,
    content: [
      'Bermuda has developed a distinctive and growing role in the global space economy, building on decades of experience in satellite communications, space insurance, and international regulatory affairs. The island\'s mid-Atlantic location, business-friendly environment, and deep financial services expertise position it as a natural hub for space industry activity.',
      'The global space economy is valued at over USD 500 billion and growing rapidly, driven by the proliferation of satellite constellations, the commercialisation of launch services, and the expansion of space-based data and connectivity applications. Bermuda is well positioned to capture a growing share of this opportunity across multiple segments.',
    ],
    sections: [
      {
        heading: 'Bermuda\'s Role in Satellite Communications',
        paragraphs: [
          'Since the early era of commercial satellite communications, Bermuda has served as an important node in the global satellite ecosystem. The island\'s geographic position provides excellent line-of-sight coverage to both the Americas and Europe, making it ideally suited for satellite tracking, telemetry, and control operations, as well as for hosting earth station infrastructure serving transatlantic communications routes.',
          'Bermuda has a long-established track record in satellite filing and regulatory administration, working within the international framework established by the International Telecommunication Union (ITU). The Government of Bermuda, through the Department of Energy, oversees the policy and legislative framework that enables operators to register satellite networks and access spectrum rights through the jurisdiction.',
        ],
      },
      {
        heading: 'Space Insurance: A Global Leader',
        paragraphs: [
          'Bermuda is widely recognised as the world\'s leading centre for space insurance and reinsurance. The island\'s specialist insurance market — home to some of the world\'s largest re/insurers — has been underwriting space risks for decades, covering everything from launch and in-orbit operations to third-party liability and emerging new-space ventures.',
          'The depth and breadth of space underwriting expertise concentrated in Bermuda is unmatched globally, providing operators with access to significant capacity, sophisticated risk structuring, and efficient claims handling in a single jurisdiction.',
        ],
      },
      {
        heading: 'Investment and Commercial Opportunities',
        paragraphs: [
          'The Government of Bermuda actively supports the development of the space economy as a strategic economic pillar. Investment opportunities span earth station development, satellite filing services, space insurance and financial products, data analytics, and the emerging sector of space tourism and commercial launch support services.',
          'Bermuda\'s international business ecosystem — including legal, financial, regulatory, and professional services — provides investors and operators with the full support infrastructure required to establish and grow space-related ventures in the jurisdiction.',
        ],
      },
    ],
    highlights: [
      'Mid-Atlantic strategic location',
      'World-leading space insurance market',
      'ITU satellite filing jurisdiction',
      'Earth station infrastructure',
      'Strong international business ecosystem',
      'Government-backed space strategy',
    ],
    crossLinks: [
      { label: 'Why Choose Bermuda', to: '/space-satellite/why-choose-bermuda' },
      { label: 'Earth Stations & Operations', to: '/space-satellite/earth-stations-operations' },
      { label: 'Space Insurance', to: '/space-satellite/space-insurance' },
    ],
  },

  'why-choose-bermuda': {
    title: 'Why Choose Bermuda',
    subtitle: 'Competitive advantages for space industry investment and operations',
    image: PAGE_IMAGES.bermuda,
    content: [
      'Bermuda offers a unique combination of strategic geography, regulatory sophistication, financial depth, and political stability that makes it one of the world\'s most attractive jurisdictions for space and satellite industry investment, operations, and risk management.',
    ],
    sections: [
      {
        heading: 'Strategic Geographic Location',
        paragraphs: [
          'Situated in the western North Atlantic, approximately 1,070 kilometres east of the United States coastline, Bermuda occupies a uniquely advantageous position for satellite and space operations. The island provides excellent elevation angles to geostationary orbital slots covering both North and South America, Europe, and Africa, making it ideal for earth station operations and satellite tracking, telemetry, and control (TT&C) services.',
          'Bermuda\'s mid-Atlantic position also provides strategic redundancy value for operators requiring geographically diverse ground segment infrastructure, particularly those serving transatlantic communications routes and maritime operations in the North Atlantic.',
        ],
        bullets: [
          'Clear sightlines to geostationary orbital arc covering Americas and Europe',
          'Strategic redundancy location for transatlantic ground segment diversity',
          'Low atmospheric interference supporting high-reliability earth station operations',
          'Proximity to major North American satellite operator headquarters',
        ],
      },
      {
        heading: 'Business and Regulatory Environment',
        paragraphs: [
          'As a British Overseas Territory, Bermuda offers a common law legal system, political stability, and strong international relationships that underpin investor confidence. The regulatory environment is transparent and internationally aligned, with a government that actively supports the development of the space and satellite sector.',
          'The Regulatory Authority of Bermuda (RA) oversees electronic communications, including spectrum licensing, while the Department of Energy coordinates space and satellite policy and ITU filing matters. Both bodies operate to international standards and engage regularly with industry stakeholders.',
        ],
        bullets: [
          'Common law legal system with strong investor protections',
          'Transparent and internationally aligned regulatory framework',
          'Active government support for space sector development',
          'Experienced regulatory bodies with international engagement',
        ],
      },
      {
        heading: 'Financial Services and Tax Advantages',
        paragraphs: [
          'Bermuda is home to one of the world\'s most sophisticated financial services ecosystems, with deep expertise in insurance, reinsurance, capital markets, and structured finance. This ecosystem is directly relevant to the space industry, which has complex risk management, financing, and structured product needs.',
          'Bermuda\'s tax-neutral environment — with no corporate income tax, capital gains tax, or withholding tax — combined with an extensive network of information exchange agreements, makes it a highly efficient jurisdiction for structuring space industry investments and operations.',
        ],
        bullets: [
          'Tax-neutral jurisdiction with no corporate income or capital gains tax',
          'World-class insurance and reinsurance market for space risk management',
          'Sophisticated capital markets and structured finance expertise',
          'Extensive international tax information exchange agreements',
        ],
      },
      {
        heading: 'Professional Services Infrastructure',
        paragraphs: [
          'Bermuda\'s professional services sector includes leading international law firms, accountancy practices, management consultants, and specialist advisors with direct experience supporting space industry clients. The island\'s talent pool, while compact, is internationally trained and connected, providing high-quality support for complex space industry transactions and operations.',
        ],
        bullets: [
          'International law firms with space and satellite sector expertise',
          'Big Four accountancy practices and specialist consultants',
          'Streamlined company formation and licensing processes',
          'Strong connectivity to London, New York, and global financial centres',
        ],
      },
    ],
    highlights: [
      'Strategic mid-Atlantic location',
      'Common law legal system',
      'Tax-neutral environment',
      'World-leading insurance market',
      'Transparent regulatory framework',
      'Political and economic stability',
    ],
    crossLinks: [
      { label: 'Earth Stations & Operations', to: '/space-satellite/earth-stations-operations' },
      { label: 'Satellite Filing & Guidance', to: '/space-satellite/satellite-filing-guidance' },
      { label: 'Space Insurance', to: '/space-satellite/space-insurance' },
    ],
  },

  'earth-stations-operations': {
    title: 'Earth Stations and Satellite Operations',
    subtitle: 'Ground segment infrastructure and satellite operations in Bermuda',
    image: PAGE_IMAGES.spaceDish,
    content: [
      'Bermuda hosts earth station infrastructure that supports a range of satellite communications, tracking, and control operations. The island\'s geographic position and stable atmospheric conditions make it well suited for high-reliability ground segment facilities serving both commercial and government satellite operators.',
    ],
    sections: [
      {
        heading: 'Earth Station Capabilities',
        paragraphs: [
          'Earth stations operating in Bermuda provide a range of ground segment services including telemetry, tracking, and control (TT&C) for satellites in geostationary and other orbital regimes, satellite communications uplinks and downlinks for commercial broadcasting and data services, and maritime and aeronautical satellite communications support for vessels and aircraft operating in the North Atlantic region.',
          'The geographic location of Bermuda provides earth stations with favourable elevation angles to geostationary satellites positioned over the Atlantic Ocean, enabling high-quality, reliable links with minimal interference from the horizon. The island\'s position also makes it valuable for monitoring and controlling satellites during critical orbital manoeuvres.',
        ],
        bullets: [
          'Telemetry, tracking & control (TT&C) for geostationary and other satellites',
          'Commercial satellite uplinks and downlinks for broadcasting and data',
          'Maritime and aeronautical satellite communications support',
          'Satellite monitoring and orbital anomaly response',
        ],
      },
      {
        heading: 'Licensing Earth Stations in Bermuda',
        paragraphs: [
          'Earth station licensing in Bermuda is administered by the Regulatory Authority of Bermuda (RA), which is responsible for managing the use of radio frequency spectrum in accordance with national legislation and relevant ITU regulations. Prospective earth station operators are required to submit an application for a station licence that includes technical specifications, proposed frequency use, and evidence of coordination with other spectrum users where applicable.',
          'The licensing process is designed to be transparent and efficient, with the RA working with applicants to ensure compliance with applicable technical and regulatory requirements. The Department of Energy coordinates with the RA on any aspects of earth station licensing that relate to broader space policy or international filing obligations.',
        ],
        bullets: [
          'Licensing by the Regulatory Authority of Bermuda (RA)',
          'Frequency coordination conducted in accordance with ITU Radio Regulations',
          'Technical review of station parameters and interference assessment',
          'Ongoing compliance monitoring and licence renewal processes',
        ],
      },
      {
        heading: 'Investment Opportunities',
        paragraphs: [
          'Bermuda presents compelling opportunities for earth station investment, particularly for operators seeking Atlantic-region ground segment diversity, TT&C backup facilities, or new earth station deployments to support growing satellite constellation services. The Government of Bermuda welcomes enquiries from operators and investors interested in establishing or expanding earth station infrastructure on the island.',
          'Suitable land and facilities may be available for earth station development through government or private arrangements. Interested parties should contact the Department of Energy to discuss requirements and the applicable regulatory and planning processes.',
        ],
      },
    ],
    highlights: [
      'TT&C services for multiple orbital regimes',
      'Favourable Atlantic geostationary arc visibility',
      'Satellite broadcasting and data support',
      'Maritime & aeronautical communications',
      'Government-supported investment environment',
    ],
    crossLinks: [
      { label: 'Satellite Filing & Guidance', to: '/space-satellite/satellite-filing-guidance' },
      { label: 'Why Choose Bermuda', to: '/space-satellite/why-choose-bermuda' },
      { label: 'Sector Enquiries', to: '/space-satellite/sector-enquiries' },
    ],
  },

  'satellite-filing-guidance': {
    title: 'Satellite Filing and Regulatory Guidance',
    subtitle: 'ITU satellite network filing and coordination services through Bermuda',
    image: PAGE_IMAGES.spaceNightsky,
    content: [
      'The Government of Bermuda provides satellite filing services through its administration with the International Telecommunication Union (ITU), enabling operators to register satellite networks and access spectrum and orbital resources under the Bermuda filing jurisdiction. The Department of Energy coordinates these filings and supports operators through the ITU regulatory process.',
    ],
    sections: [
      {
        heading: 'Overview of ITU Satellite Filing',
        paragraphs: [
          'The ITU Radio Regulations provide the international framework for the coordination, notification, and registration of satellite networks. All satellite operators accessing spectrum and orbital resources must comply with these procedures to establish internationally recognised rights to operate their satellite systems. Bermuda, as a British Overseas Territory, participates in ITU processes and can file satellite networks on behalf of operators seeking to use Bermuda as their filing administration.',
          'Filing a satellite network through Bermuda provides operators with access to ITU-recognised spectrum and orbital rights, which are essential for commercially operating satellites and protecting them from interference by other networks. The Department of Energy works closely with operators to navigate the ITU process and ensure filings are submitted accurately and in accordance with applicable deadlines and technical requirements.',
        ],
      },
      {
        heading: 'The Filing Process',
        paragraphs: [
          'The ITU satellite filing process involves several distinct regulatory steps, each with specific technical and procedural requirements. The key stages typically include advance publication of satellite network information in the ITU Special Section, coordination with other administrations and satellite networks potentially affected by radio frequency interference, and notification and registration of the network once coordination is complete.',
          'The Department of Energy assists operators in preparing the technical filings required at each stage, engaging with the ITU Radiocommunication Bureau and with other administrations as required. Operators should engage with the Department at the earliest stage of their project planning to ensure the filing timeline is appropriately built into project schedules, as the ITU process can take several years to complete.',
        ],
        bullets: [
          'Advance Publication (AP) — initial notice to ITU of planned satellite network',
          'Coordination — bilateral and multilateral coordination with potentially affected networks',
          'Notification and Registration — formal registration of ITU filing rights',
          'Ongoing maintenance — modifications, extensions, and renewals as required',
        ],
      },
      {
        heading: 'Fees and Requirements',
        paragraphs: [
          'Satellite filing services are subject to administrative fees payable to the Government of Bermuda, in addition to any applicable ITU cost recovery fees. Fee schedules are available from the Department of Energy on request. Operators must provide detailed technical information about their proposed satellite network, including orbital parameters, frequency bands, coverage areas, and power flux density specifications.',
          'All filings must comply with the ITU Radio Regulations and applicable international coordination requirements. The Department of Energy provides guidance on documentation requirements and technical standards applicable to each filing stage.',
        ],
        bullets: [
          'Administrative fees payable to the Government of Bermuda',
          'ITU cost recovery fees as applicable',
          'Technical network data required at each filing stage',
          'Compliance with ITU Radio Regulations and relevant Appendices',
        ],
      },
    ],
    highlights: [
      'ITU-compliant filing administration',
      'Advance publication & coordination support',
      'Notification and registration services',
      'Technical guidance and documentation',
      'Experienced regulatory coordination team',
    ],
    crossLinks: [
      { label: 'Earth Stations & Operations', to: '/space-satellite/earth-stations-operations' },
      { label: 'National Space Strategy', to: '/space-satellite/national-space-strategy' },
      { label: 'Sector Enquiries', to: '/space-satellite/sector-enquiries' },
    ],
  },

  'space-insurance': {
    title: 'Space Insurance',
    subtitle: 'Bermuda — the world\'s leading centre for space insurance and reinsurance',
    image: PAGE_IMAGES.spaceInsurance,
    content: [
      'Bermuda occupies a unique and globally pre-eminent position in the space insurance market. The island\'s specialist insurance and reinsurance sector has been underwriting space risks for decades, providing operators worldwide with access to world-class capacity, expertise, and financial security for all phases of satellite and launch operations.',
    ],
    sections: [
      {
        heading: 'Bermuda\'s Space Insurance Market',
        paragraphs: [
          'The Bermuda insurance market is widely acknowledged as the global leader in space risk underwriting. Several of the world\'s largest and most experienced space insurers and reinsurers are domiciled in or maintain significant operations in Bermuda, providing unparalleled depth of capacity and expertise in a single jurisdiction.',
          'Bermuda underwriters have participated in the insurance of satellite launches, in-orbit operations, and major commercial space programmes for operators across North America, Europe, Asia, and the Middle East. The island\'s market has the financial strength, technical knowledge, and appetite to cover risks across the full spectrum of space activities — from conventional geostationary communications satellites to innovative new-space ventures.',
        ],
        bullets: [
          'Home to leading global space insurers and reinsurers',
          'Significant underwriting capacity for all classes of space risk',
          'Deep technical expertise in satellite and launch risk assessment',
          'Track record covering major commercial and government space programmes',
        ],
      },
      {
        heading: 'Classes of Space Insurance',
        paragraphs: [
          'The Bermuda market provides coverage across all major classes of space insurance. Pre-launch and launch insurance covers satellites and launch vehicles during the build, testing, integration, and launch phases, including partial and total loss resulting from launch failure. In-orbit insurance protects operating satellites against total loss, partial loss, and third-party liability during the operational life of the spacecraft.',
          'Emerging areas of space risk — including small satellites, constellation deployments, on-orbit servicing, and commercial human spaceflight — are also areas in which Bermuda underwriters are actively developing capacity and expertise, reflecting the evolving nature of the global space economy.',
        ],
        bullets: [
          'Pre-launch and launch insurance (including launch failure coverage)',
          'In-orbit total and partial loss coverage',
          'Third-party liability insurance for satellite operations',
          'Small satellite and new-space constellation programmes',
          'Emerging risks: on-orbit servicing, commercial human spaceflight',
        ],
      },
      {
        heading: 'Regulatory Framework',
        paragraphs: [
          'Space insurers operating in Bermuda are regulated by the Bermuda Monetary Authority (BMA), which provides a robust, internationally recognised regulatory framework. The BMA\'s oversight ensures that Bermuda-based insurers maintain appropriate capital reserves, risk management frameworks, and governance standards, providing policyholders with confidence in the financial security of their space insurance programmes.',
          'Bermuda\'s equivalence with major international regulatory standards, including Solvency II, makes it an efficient and credible jurisdiction for global space insurance transactions and reinsurance arrangements.',
        ],
      },
    ],
    highlights: [
      'Global leader in space risk underwriting',
      'Launch & in-orbit coverage expertise',
      'Third-party liability programmes',
      'BMA-regulated market with Solvency II equivalence',
      'Coverage for new-space and emerging risks',
    ],
    crossLinks: [
      { label: 'Why Choose Bermuda', to: '/space-satellite/why-choose-bermuda' },
      { label: 'Bermuda & Global Space Economy', to: '/space-satellite/bermuda-global-space-economy' },
      { label: 'Sector Enquiries', to: '/space-satellite/sector-enquiries' },
    ],
  },

  'national-space-strategy': {
    title: 'National Space Strategy and Policy Documents',
    subtitle: 'Bermuda\'s strategic framework for the space and satellite sector',
    image: PAGE_IMAGES.spaceStrategy,
    content: [
      'The Government of Bermuda has developed a National Space Strategy that sets out the island\'s vision, priorities, and objectives for the development of the space and satellite sector. The strategy reflects the Government\'s commitment to growing Bermuda\'s role in the global space economy and positioning the jurisdiction as a leading destination for space industry investment, operations, and expertise.',
    ],
    sections: [
      {
        heading: 'National Space Strategy 2020–2025',
        paragraphs: [
          'The National Space Strategy 2020–2025 establishes a comprehensive framework for the development of Bermuda\'s space sector across four key pillars: regulatory and policy development, earth station and infrastructure investment, space insurance and financial services, and international engagement and partnerships.',
          'The strategy sets clear objectives for each pillar, including the modernisation of the legislative and regulatory framework for space activities, the promotion of Bermuda as a destination for earth station investment, the continued development of the island\'s space insurance market, and the strengthening of Bermuda\'s engagement with the ITU and other international space governance bodies.',
        ],
        bullets: [
          'Regulatory and policy modernisation for the space sector',
          'Earth station infrastructure investment and promotion',
          'Space insurance and financial services development',
          'International engagement with ITU and space governance bodies',
          'Human capital development and space education initiatives',
        ],
      },
      {
        heading: 'Policy and Consultation Documents',
        paragraphs: [
          'The Government periodically publishes consultation documents on proposed legislative and regulatory changes affecting the space and satellite sector. These consultations invite input from industry stakeholders, operators, and members of the public on proposed policy directions, and form part of the Government\'s commitment to transparent and participatory policy development.',
          'All active and archived consultation documents relating to the space and satellite sector are available through the Government\'s consultation portal. Interested parties are encouraged to participate in consultations to help shape the future policy environment for space activities in Bermuda.',
        ],
      },
    ],
    highlights: [
      'National Space Strategy 2020–2025',
      'Four strategic pillars: regulation, infrastructure, insurance, international engagement',
      'Transparent policy development process',
      'Open stakeholder consultations',
      'ITU and international space body engagement',
    ],
    documents: [
      { title: 'National Space Strategy 2020–2025', url: '#', size: '3.4 MB' },
      { title: 'Space & Satellite Consultation', url: EXTERNAL_LINKS.consultationsForum, size: 'External' },
    ],
    crossLinks: [
      { label: 'Bermuda & Global Space Economy', to: '/space-satellite/bermuda-global-space-economy' },
      { label: 'Satellite Filing & Guidance', to: '/space-satellite/satellite-filing-guidance' },
      { label: 'Sector Enquiries', to: '/space-satellite/sector-enquiries' },
    ],
  },

  'sector-enquiries': {
    title: 'Space Sector Enquiries',
    subtitle: 'Connect with the Department of Energy on space and satellite matters',
    image: PAGE_IMAGES.spaceAstronaut,
    content: [
      'The Department of Energy is the primary point of contact for enquiries relating to space and satellite policy, earth station licensing, ITU satellite filing, and investment opportunities in Bermuda\'s space sector. We welcome enquiries from satellite operators, investors, insurers, and other stakeholders with an interest in Bermuda\'s space and satellite industry.',
    ],
    sections: [
      {
        heading: 'Types of Enquiries',
        paragraphs: [
          'The Department handles a broad range of space and satellite sector enquiries, including questions about ITU satellite filing procedures and fees, earth station licensing and regulatory requirements, space sector investment and business development opportunities, policy and legislative matters relating to the space sector, and engagement with the National Space Strategy.',
        ],
        bullets: [
          'ITU satellite filing — procedures, fees, and timelines',
          'Earth station licensing and spectrum management',
          'Space sector investment and business development',
          'Space insurance regulatory questions',
          'National Space Strategy engagement and consultation',
        ],
      },
    ],
    contact: {
      email: 'energy@gov.bm',
      phone: '441-444-0597',
      address: 'Department of Energy, Government Administration Building, 30 Parliament Street, Hamilton HM 12, Bermuda',
      hours: 'Monday – Friday, 9:00 AM – 5:00 PM',
    },
    highlights: [
      'Satellite filing enquiries',
      'Earth station licensing',
      'Investment opportunities',
      'Policy and legislation',
      'National Space Strategy',
    ],
  },
}
