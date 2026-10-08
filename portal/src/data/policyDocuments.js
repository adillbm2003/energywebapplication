import { nespPolicyBlocks } from './documents/nespPolicy'
import { earthStationsFrameworkBlocks } from './documents/earthStationsFramework'

const base = import.meta.env.BASE_URL || '/'

// Policy documents published as supplied by the Department, with the PDF itself
// served alongside the page. The summaries and the contents lists are taken from
// each document's own wording and table of contents rather than rewritten, so the
// page says what the document says and nothing further.
//
// The register on /policies is CMS-driven and answers from /api/policies. These
// two are held here because they are published documents with a file behind
// them, not rows someone maintains in the CMS.
export const policyDocuments = {
  'national-electricity-sector-policy-2026': {
    title: 'The National Electricity Sector Policy',
    shortTitle: 'National Electricity Sector Policy (NESP 2026)',
    status: 'Active',
    date: 'April 2026',
    issuedBy: 'Government of Bermuda, Ministry of Home Affairs',
    file: base + 'documents/national-electricity-sector-policy-2026.pdf',
    blocks: nespPolicyBlocks,
    fileSize: '6.1 MB',
    summary: [
      'The National Electricity Sector Policy sets out the Government’s policy direction for the structure, planning and regulation of Bermuda’s electricity sector. Its objective is to reduce Bermuda’s reliance on fossil fuels by increasing the share of renewable energy, while simultaneously ensuring affordability, equity, and system stability.',
      'The policy is deliberately technology-agnostic. Rather than prescribing specific generation technologies, capacity levels, or fixed carbon targets, it establishes clear principles to guide planning and regulatory decisions through the Integrated Resource Planning process.',
    ],
    contents: [
      { number: '1', title: 'Introduction', children: ['1.1 Purpose of the Updated Policy', '1.2 National Development Goals, Climate Commitments and Just Energy Transition Alignment'] },
      { number: '2', title: 'Context', children: ['2.1 Historical Overview', '2.2 Developments Since NESP 2015', '2.3 Current Challenges: Cost, Equity, Security, and Sustainability', '2.4 Lessons from Past Policy Implementation'] },
      { number: '3', title: '2045 Vision and Rate Drivers', children: ['3.1 2045 Vision: Reliable, Affordable, Equitable and Low Carbon Electricity', '3.2 Benchmarks for Affordability', '3.3 Main Impacts on Rate Stabilisation'] },
      { number: '4', title: 'Structure of the Electricity Sector', children: ['4.1 The Ministry responsible for Energy', '4.2 The Regulatory Authority', '4.3 The Electric Utility', '4.4 Independent Power Producers', '4.5 BG Sole Use Installation (BGSUI)', '4.6 Innovative Licence (IL)', '4.7 End Users', '4.8 Distributed Generators (DG)', '4.9 Community and Cooperative Energy Models'] },
      { number: '5', title: 'Integrated Resource Planning and Policy Objectives', children: ['5.1 IRP as the Central Planning Tool', '5.2 IRP Informing Future Policy Objectives', '5.3 Resilience and Security Considerations', '5.4 Incorporation of Energy Storage in Resource Planning'] },
      { number: '6', title: 'Distributed Generation (DG) and Energy Equity', children: ['6.1 Access and Financing Mechanisms for Low Income Households', '6.2 Community and Cooperative Solar', '6.3 Micro-Grid Policy'] },
      { number: '7', title: 'Bulk Generation', children: ['7.1 Procurement Rules', '7.2 Renewable Energy Priority in Resource Mix', '7.3 Green Hydrogen, Biomass, Waste to Energy Policy Direction', '7.4 Local Benefit and Industrial Participation Requirements'] },
      { number: '8', title: 'Transmission, Distribution, and Retail', children: ['8.1 Tariff Structures and Cost Reflectivity', '8.2 Grid Modernization, Strategy and Smart Metering', '8.3 Consumer Protection Framework', '8.4 Industrial Auditing Program', '8.5 Performance Based Regulation (PBR)'] },
      { number: '9', title: 'Electric Vehicles and Transport Electrification', children: ['9.1 Alignment with Government’s Electric Vehicle Transition Strategy', '9.2 National Electric Vehicle Charging Infrastructure Framework', '9.3 Role of EVs in Increasing kWh Sales and Tariff Stability', '9.5 Battery Lifecycle Management and Sustainability'] },
      { number: '10', title: 'Renewable Energy Market Oversight', children: ['10.1 Installer Licensing and National Certification', '10.2 Installation Standards and Compliance', '10.3 Just Energy Transition Framework: Workforce Reskilling', '10.4 Climate Resilience and Adaptation Targets'] },
      { number: '11', title: 'End-Use Efficiency and Demand-Side Resources', children: ['11.1 Planning for Demand-Side Resources', '11.2 Supporting End-User Conservation', '11.3 Appliances Standards, Labelling and Building Codes'] },
      { number: '12', title: 'Legal and Regulatory Framework', children: ['12.1 EA 2016 and Related Laws', '12.2 Amendments Needed for Installer Certification', '12.3 Enforcement Powers', '12.3 Cross-Ministerial Linkages'] },
      { number: '13', title: 'Appendices', children: ['13.1 References', '13.3 Abbreviations, Acronyms and Definitions'] },
    ],
  },

  'national-earth-stations-licensing-framework-2026': {
    title: 'National Earth Stations Licensing Framework',
    shortTitle: 'National Earth Stations Licensing Framework',
    status: 'Published',
    date: 'May 2026',
    issuedBy: 'Government of Bermuda, Ministry of Home Affairs',
    file: base + 'documents/national-earth-stations-licensing-framework-2026.pdf',
    blocks: earthStationsFrameworkBlocks,
    fileSize: '4.0 MB',
    summary: [
      'This Framework is issued by the Government of Bermuda as a statement of national policy for the licensing and operation of Earth Stations. The Government sets policy direction. The Regulatory Authority of Bermuda implements that policy within its statutory mandate.',
      'Under this Framework, satellite-based electronic communications services and ground network operations will be licensed through the Communications Operating Licence (COL) issued by the Regulatory Authority, together with spectrum licences to allow the use of frequencies by earth stations.',
    ],
    note: 'The Framework comes into effect on a date to be determined. Existing operators will be granted a 12-month period to bring their operations into full compliance.',
    contents: [
      { number: '1', title: 'Minister’s Vision' },
      { number: '2', title: 'Policy Framework and Regulatory Mandate' },
      { number: '3', title: 'Definitions' },
      { number: '4', title: 'Introduction and Framework Objectives' },
      { number: '5', title: 'Scope and Application' },
      { number: '6', title: 'Licensing Requirements', children: ['6.1 Communications Operating Licence', '6.2 Spectrum Licence', '6.3 Type Approval and Homologation of Equipment'] },
      { number: '7', title: 'Technical and Operational Standards' },
      { number: '8', title: 'Compliance and Monitoring' },
      { number: '9', title: 'Network Security and Data Protection' },
      { number: '10', title: 'Assistance with Law Enforcement Agencies' },
      { number: '11', title: 'Enforcement and Penalties' },
      { number: '12', title: 'Transitional Provisions' },
      { number: '13', title: 'Amendments and Updates' },
      { number: '14', title: 'Stakeholder Collaboration' },
      { number: '15', title: 'Effective Date' },
    ],
  },
}

export const policyDocumentList = Object.entries(policyDocuments).map(([slug, doc]) => ({ slug, ...doc }))
