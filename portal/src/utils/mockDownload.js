// Safe PDF string: strip non-ASCII, escape parens + backslash
function ps(s) {
  return String(s)
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/[()\\]/g, '\\$&')
}

// Wrap text into lines no longer than maxLen characters
function wrap(text, maxLen = 88) {
  const out = []
  String(text).split('\n').forEach(para => {
    if (!para.trim()) { out.push(''); return }
    const words = para.split(' ')
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (test.length > maxLen) { if (line) out.push(line); line = w }
      else line = test
    }
    if (line) out.push(line)
  })
  return out
}

// ── Category-specific rich content ────────────────────────────────────────────
const RICH = {
  'Appliance Guides': {
    intro: 'Bermuda households face some of the world\'s highest electricity rates at approximately $0.31-$0.38 per kWh from BELCO. Choosing energy-efficient appliances and using them wisely can save hundreds of dollars annually and thousands over an appliance\'s lifetime.',
    sections: [
      {
        title: 'ENERGY STAR CERTIFICATION',
        body: [
          'ENERGY STAR certified appliances use 10-50% less energy than standard models.',
          'U.S. Department of Energy sets minimum efficiency standards for all rated equipment.',
          'Bermuda Government recommends ENERGY STAR certified equipment for all major purchases.',
          '',
          'APPLIANCE TYPE        STANDARD USE       ENERGY STAR USE    ANNUAL SAVINGS',
          'Refrigerator          600-800 kWh/yr     Under 400 kWh/yr   $62-$124/year',
          'Air Conditioner       1,800-2,400 kWh    1,000-1,400 kWh    $248-$310/year',
          'Washing Machine       500 kWh/year       150 kWh/year       $109/year',
          'Water Heater          3,000 kWh/year     Under 1,500 kWh    $465/year',
        ]
      },
      {
        title: 'BERMUDA ELECTRICITY COST CONTEXT',
        body: [
          'Average household electricity consumption: 600-900 kWh/month',
          'Average monthly BELCO bill: $186-$342 (at $0.31/kWh)',
          'Annual household electricity cost: $2,232-$4,104',
          '',
          'Reducing consumption by just 20% saves $446-$821 per year.',
          'Upgrading to ENERGY STAR appliances can reduce consumption 30-50%.',
          '',
          'PRIORITY UPGRADES BY IMPACT:',
          '1. Air Conditioner   - 40-50% of electricity use - Replace if over 10 years old',
          '2. Water Heater      - 18% of electricity use   - Switch to solar water heater',
          '3. Washer/Dryer      - 15-25% of electricity   - Choose front-loader (150 kWh/yr)',
          '4. Lighting          - 8-12% of electricity    - Replace all bulbs with LED',
          '5. Refrigerator      - 5-10% of electricity    - Choose under 400 kWh/yr model',
        ]
      },
      {
        title: 'QUICK SAVINGS - ZERO OR LOW COST ACTIONS',
        body: [
          'The following actions cost nothing and can be done immediately:',
          '',
          'Switch off lights when leaving any room              Saves $30-$60/year',
          'Set air conditioner thermostat to 78F (26C)          Saves $200-$400/year',
          'Wash clothes in cold water instead of hot            Saves $50-$100/year',
          'Unplug electronics when not in use (vampire loads)   Saves $50-$150/year',
          'Clean AC filters every month for better efficiency   Saves $50-$100/year',
          'Keep refrigerator coils clean and door seals tight   Saves $30-$60/year',
          'Use clothesline instead of electric dryer            Saves $120-$180/year',
          '',
          'TOTAL POTENTIAL SAVINGS FROM BEHAVIOUR CHANGES: $530-$1,050 PER YEAR',
        ]
      }
    ]
  },
  'Renewable Energy': {
    intro: 'Bermuda\'s abundant sunshine averaging over 3,000 hours per year, consistent trade winds, and very high electricity costs make renewable energy an excellent investment. The Government of Bermuda actively supports renewable energy through policy, incentives, and planning approvals.',
    sections: [
      {
        title: 'BERMUDA SOLAR PV STATISTICS (2019-2025)',
        body: [
          'Data Source: Department of Planning permit records',
          '',
          'Total Permit Applications Filed:      783',
          'Active Installations (Complete/Issued): 772',
          'Estimated Total Installed Capacity:   129 MW',
          'Largest Single Project:               6 MW (Airport Solar Farm, 2017)',
          '2025 Distributed Generation Target:   14.3 MW',
          '',
          'APPLICATIONS BY YEAR:',
          '2019: 87 permits    2022: 143 permits',
          '2020: 104 permits   2023: 167 permits',
          '2021: 121 permits   2024: 156 permits',
          '',
          'TOP PARISHES FOR SOLAR INSTALLATIONS:',
          'Paget: 124    Pembroke: 113    Warwick: 112    Smiths: 98',
        ]
      },
      {
        title: 'RENEWABLE ENERGY COST & PAYBACK',
        body: [
          'SYSTEM TYPE            TYPICAL COST         ANNUAL SAVINGS    PAYBACK',
          'Solar Water Heater     $4,000-$10,000       $650-$750/yr      4-5 years',
          'Solar PV (10 kW)       $15,000-$21,000      $2,500-$4,000/yr  5-8 years',
          'Micro-Wind (3 kW)      $21,000-$27,000      $1,500-$2,500/yr  8-10 years',
          '',
          'Note: All costs are before any applicable government incentives.',
          'All systems require a DAPR permit from the Department of Planning.',
          'BELCO connection and inspection required for grid-tied systems.',
          '',
          'NET METERING:',
          'Bermuda\'s Electricity Act 2016 enables net metering.',
          'Excess generation exported to BELCO grid earns credit at retail rate.',
          'System must be certified and inspected before connection.',
          'Contact BELCO Distributed Generation team for application details.',
        ]
      },
      {
        title: 'GETTING STARTED WITH RENEWABLE ENERGY',
        body: [
          'STEP 1: Conduct a Home Energy Audit',
          '        Identify your largest energy consumers first.',
          '        Reduce consumption before sizing a renewable system.',
          '',
          'STEP 2: Choose a Certified Installer',
          '        SRCC certified for solar water heaters.',
          '        NABCEP certified for solar PV and wind systems.',
          '        Verify installer experience with hurricane-rated installations.',
          '',
          'STEP 3: Obtain Planning Approval',
          '        Apply for a DAPR permit (or Permitted Development Permit).',
          '        Processing typically takes 4-8 weeks.',
          '',
          'STEP 4: Install and Connect',
          '        Professional installation by certified technician.',
          '        BELCO inspection and connection for grid-tied systems.',
          '',
          'For further information: energy@gov.bm | www.gov.bm',
        ]
      }
    ]
  },
  'Energy Efficiency': {
    intro: 'Energy efficiency is the fastest and most cost-effective way to reduce electricity bills in Bermuda. Simple changes in behaviour and affordable upgrades can cut energy use by 20-40%, saving hundreds of dollars each year with little or no upfront investment.',
    sections: [
      {
        title: 'HOME ENERGY AUDIT CHECKLIST',
        body: [
          'Complete this checklist to identify your best energy-saving opportunities:',
          '',
          'AIR CONDITIONING (40-50% of electricity)',
          '[ ] Is your AC unit over 10 years old? (Consider replacing)',
          '[ ] Is the thermostat set above 78F (26C)?',
          '[ ] Are filters cleaned monthly?',
          '[ ] Are doors and windows closed when AC is running?',
          '[ ] Is there shading on south/west windows?',
          '',
          'WATER HEATING (18% of electricity)',
          '[ ] Do you have a solar water heater? (Best investment in Bermuda)',
          '[ ] Is your water heater temperature set to 120F (49C)?',
          '[ ] Are hot water pipes insulated?',
          '',
          'LIGHTING (8-12% of electricity)',
          '[ ] Are all bulbs LED? (Switch from incandescent or CFL)',
          '[ ] Are lights turned off in unoccupied rooms?',
          '[ ] Do you use natural daylight when possible?',
        ]
      },
      {
        title: 'SAVINGS POTENTIAL BY IMPROVEMENT',
        body: [
          'IMPROVEMENT                      COST         ANNUAL SAVINGS   PAYBACK',
          'Replace incandescent with LED    $5-$15/bulb  $100-$250/year   6-18 months',
          'Install solar water heater       $4,000-$10K  $650-$750/year   4-5 years',
          'Upgrade to ENERGY STAR AC        $1,500-$3K   $200-$400/year   4-8 years',
          'Smart power strips (5 strips)    $50-$100     $100-$200/year   Under 1 year',
          'Insulate hot water pipes         $50-$150     $50-$100/year    Under 2 years',
          'Weather-strip doors/windows      $30-$100     $30-$80/year     1-2 years',
          '',
          'BEHAVIOUR CHANGES (NO COST):',
          'Use clothesline instead of dryer     Saves $120-$180/year',
          'Set AC higher (78F vs 74F)            Saves $150-$300/year',
          'Wash in cold water                    Saves $50-$100/year',
          'Unplug standby electronics            Saves $50-$150/year',
          '',
          'TOTAL POTENTIAL SAVINGS: $500-$2,000+ PER YEAR',
        ]
      },
      {
        title: 'READING YOUR BELCO BILL',
        body: [
          'Understanding your electricity bill helps identify opportunities:',
          '',
          'kWh CONSUMPTION: Your total usage. Compare month-to-month.',
          'FUEL RIDER: Variable charge based on fuel oil prices. Rises in winter.',
          'DEMAND CHARGE: If applicable to your tariff, based on peak usage.',
          '',
          'TYPICAL BERMUDA HOUSEHOLD CONSUMPTION:',
          'Very Efficient Home:   300-500 kWh/month   ($93-$155/month)',
          'Average Efficiency:    600-900 kWh/month   ($186-$279/month)',
          'Less Efficient Home:   1,000+ kWh/month    ($310+/month)',
          '',
          'If your bill exceeds the average, focus on AC and water heating first.',
          'Contact Department of Energy for a free home energy assessment referral.',
          'Email: energy@gov.bm | Tel: (441) 295-5151',
        ]
      }
    ]
  },
  'EVs': {
    intro: 'Bermuda\'s electric vehicle programme supports the transition to cleaner, more sustainable transport. With 1,767 registered electric vehicles as of 2026, Bermuda\'s EV fleet spans all vehicle categories from private cars and rental mini-cars to buses and government vehicles.',
    sections: [
      {
        title: 'BERMUDA EV FLEET DATA (2026)',
        body: [
          'Source: Registrar of Vehicles, Bermuda',
          '',
          'VEHICLE CATEGORY           REGISTERED EVs    % OF EV FLEET',
          'Private Cars               987               55.9%',
          'Rental Mini-Cars           421               23.8%',
          'Motorcycles & Cycles       154                8.7%',
          'Trucks                     100                5.7%',
          'Buses (Omnibus)             68                3.8%',
          'Government Vehicles         31                1.8%',
          'Taxis & Other                6                0.3%',
          '                          ----              ------',
          'TOTAL ELECTRIC VEHICLES   1,767             100.0%',
          '',
          'EV fleet growth reflects strong uptake following duty concessions',
          'and the introduction of 70 electric buses to the public transit fleet.',
        ]
      },
      {
        title: 'GOVERNMENT INCENTIVES & BENEFITS',
        body: [
          'DUTY CONCESSIONS:',
          'Private EV imports currently receive duty concessions from Bermuda Customs.',
          'This significantly reduces the purchase price compared to petrol vehicles.',
          'Check current concession rates with Bermuda Customs at www.gov.bm.',
          '',
          'OPERATING COST COMPARISON:',
          '                    ELECTRIC VEHICLE      PETROL VEHICLE',
          'Annual Energy Cost   $800 - $1,500         $3,000 - $5,000',
          'Annual Maintenance   Lower (fewer parts)   Higher',
          'Import Duty          Concession rate       Standard rate',
          'Emissions            Zero locally          High (CO2)',
          'Noise Level          Very low              Standard',
          '',
          'LIFETIME SAVINGS (15 years vs equivalent petrol vehicle):',
          'Energy savings: $21,000 - $52,500',
          'Duty savings:   Varies by vehicle value',
          'Maintenance:    Estimated $5,000 - $10,000 less',
          'TOTAL ESTIMATED SAVING: $26,000 - $62,500 over vehicle lifetime',
        ]
      },
      {
        title: 'EV CHARGING IN BERMUDA',
        body: [
          'CHARGING TYPES:',
          'Level 1 (120V):  Standard outlet. 4-6 miles of range per hour of charging.',
          'Level 2 (240V):  Dedicated home charger. 20-30 miles of range per hour.',
          'DC Fast Charge:  Public stations. 80% charge in 20-40 minutes.',
          '',
          'HOME CHARGING INSTALLATION:',
          'Level 2 charger hardware:   $300 - $800',
          'Installation by electrician: $500 - $1,200',
          'Total home setup cost:      $800 - $2,000',
          '',
          'For most Bermuda drivers, overnight Level 2 home charging is sufficient.',
          'Bermuda\'s compact geography means range anxiety is not a concern.',
          '',
          'BELCO EV TARIFF:',
          'BELCO offers specific tariff rates for EV charging.',
          'Contact BELCO for current EV tariff information.',
          '',
          'Contact: Department of Energy | energy@gov.bm | www.gov.bm',
        ]
      }
    ]
  },
  'Sustainability': {
    intro: 'Bermuda is committed to an ambitious clean energy transition. The Government\'s energy strategy targets significant reductions in fossil fuel dependency through renewable energy adoption, energy efficiency improvements, and sustainable transport policies.',
    sections: [
      {
        title: 'BERMUDA ENERGY TRANSITION MILESTONES',
        body: [
          'YEAR   MILESTONE',
          '2010   Solar Rebate Programme launched - first structured solar incentive',
          '2015   National Electricity Policy published - strategic framework established',
          '2016   Electricity Act 2016 passed - legal framework for DG and net metering',
          '2017   6 MW Airport Solar Farm commissioned - largest single solar project',
          '2018   National Fuels Policy adopted - fuel import and storage standards',
          '2022   Fuels Act enacted - modern regulatory framework for fuel sector',
          '2023   70 electric buses introduced to Bermuda public transit fleet',
          '2025   14.3 MW distributed generation target for solar PV installations',
          '2035   Long-term renewable energy transition goal',
          '',
          'CURRENT STATUS:',
          '783 solar PV permit applications processed (2019-2025)',
          '772 active solar installations across all parishes',
          'Estimated 129 MW total solar PV capacity installed island-wide',
          '1,767 electric vehicles registered across all categories',
        ]
      },
      {
        title: 'HOW INDIVIDUALS CAN SUPPORT THE TRANSITION',
        body: [
          '1. SWITCH TO RENEWABLE ENERGY',
          '   Install solar water heater (payback 4-5 years in Bermuda)',
          '   Install solar PV system (meet 70-100% of home electricity needs)',
          '   Consider micro-wind if your property has good wind exposure',
          '',
          '2. CHOOSE ELECTRIC OR HYBRID TRANSPORT',
          '   EVs qualify for duty concessions on import',
          '   Annual operating costs 60-70% lower than petrol vehicles',
          '   Zero local emissions contribute to cleaner air quality',
          '',
          '3. REDUCE ENERGY CONSUMPTION',
          '   Conduct a home energy audit to find quick wins',
          '   Replace all lighting with LED bulbs',
          '   Upgrade to ENERGY STAR certified appliances',
          '   Use smart power strips to eliminate vampire loads',
          '',
          '4. ENGAGE WITH GOVERNMENT PROGRAMMES',
          '   Apply for available renewable energy incentives',
          '   Participate in public consultations on energy policy',
          '   Contact the Department of Energy: energy@gov.bm',
        ]
      },
      {
        title: 'ENVIRONMENTAL & ECONOMIC IMPACT',
        body: [
          'BERMUDA ENERGY CONTEXT:',
          'Bermuda imports all fuel oil for electricity generation.',
          'Fuel costs are the primary driver of high electricity prices.',
          'Every kWh generated from renewable energy reduces fuel imports.',
          '',
          'ISLAND-WIDE IMPACT OF CURRENT SOLAR INSTALLATIONS:',
          'Estimated annual generation: 100+ GWh from 129 MW capacity',
          'Equivalent fuel oil displaced: Thousands of barrels annually',
          'CO2 emissions avoided: Significant reduction in local emissions',
          '',
          'ECONOMIC BENEFITS OF ENERGY TRANSITION:',
          'Reduced fuel import bills for Government and consumers',
          'New local industry and employment in renewable energy sector',
          'Increased energy security and price stability',
          'Alignment with global ESG and climate commitments',
          '',
          'For more information on Bermuda\'s energy transition:',
          'Visit: www.gov.bm/energy',
          'Email: energy@gov.bm',
          'Department of Energy, Government Administration Building,',
          '30 Parliament Street, Hamilton HM11, Bermuda',
        ]
      }
    ]
  },
  'Space & STEM': {
    intro: 'Bermuda occupies a strategically important position in the Atlantic, making it a valuable location for space services, satellite tracking, and telecommunications infrastructure. The Department of Energy supports STEM education and career pathways in Bermuda\'s growing technology sectors.',
    sections: [
      {
        title: 'BERMUDA AND SPACE SERVICES',
        body: [
          'STRATEGIC LOCATION:',
          'Bermuda sits at 32 degrees North latitude in the mid-Atlantic.',
          'This provides a unique vantage point for satellite tracking and communication.',
          'Several major international space and communications facilities operate in Bermuda.',
          '',
          'KEY FACILITIES AND OPERATORS:',
          'Ground station facilities support major satellite operators.',
          'Undersea cable landing stations connect Bermuda to global networks.',
          'Telecommunications infrastructure serves Atlantic routing requirements.',
          '',
          'ECONOMIC CONTRIBUTION:',
          'Space and satellite services are a significant part of Bermuda\'s economy.',
          'These sectors provide high-skill employment opportunities for Bermudians.',
          'The Government supports growth in technology and digital infrastructure.',
        ]
      },
      {
        title: 'STEM EDUCATION AND CAREERS',
        body: [
          'CAREER PATHWAYS IN ENERGY AND TECHNOLOGY:',
          '',
          'ENGINEERING',
          'Electrical Engineer         - Design and maintain power systems',
          'Renewable Energy Engineer   - Solar, wind, and battery storage systems',
          'Telecommunications Engineer - Satellite and cable infrastructure',
          '',
          'SCIENCE AND ENVIRONMENT',
          'Environmental Scientist     - Energy impact assessment and monitoring',
          'Climate Analyst             - Carbon accounting and sustainability',
          '',
          'BUSINESS AND POLICY',
          'Energy Policy Analyst       - Government and regulatory roles',
          'Project Finance             - Funding renewable energy projects',
          '',
          'GOVERNMENT SUPPORT:',
          'The Bermuda Government offers bursaries for STEM students.',
          'Contact the Department of Education for current bursary programmes.',
          'Department of Energy also supports internships and work placements.',
          'Visit: www.gov.bm/bursary for application details.',
        ]
      },
      {
        title: 'RESOURCES AND NEXT STEPS',
        body: [
          'EDUCATIONAL RESOURCES:',
          'Department of Energy Education Centre: www.gov.bm/energy/education',
          'BELCO STEM outreach programme: www.belco.bm',
          'Bermuda Institute of Ocean Sciences (BIOS): www.bios.edu',
          '',
          'SCHOLARSHIPS AND BURSARIES:',
          'Bermuda Government Scholarship Programme - Annual competitive awards',
          'Energy sector bursaries for qualifying students',
          'Contact: Department of Education, Hamilton, Bermuda',
          '',
          'INTERNSHIP OPPORTUNITIES:',
          'Department of Energy summer internship programme',
          'Private sector placements through Bermuda College',
          '',
          'Contact the Department of Energy:',
          'Email: energy@gov.bm',
          'Tel: (441) 295-5151',
          'Government Administration Building',
          '30 Parliament Street, Hamilton HM11, Bermuda',
        ]
      }
    ]
  },
  'Policy': {
    intro: 'The Department of Energy develops and implements policies to guide Bermuda\'s energy sector. All policies are developed through stakeholder consultation and in alignment with the National Electricity Policy and the Electricity Act 2016.',
    sections: [
      {
        title: 'BERMUDA ENERGY POLICY FRAMEWORK',
        body: [
          'GOVERNING LEGISLATION:',
          'Electricity Act 2016 - Primary legislation for electricity sector',
          'National Electricity Policy (2015) - Strategic energy framework',
          'National Fuels Policy (2018) - Fuel import and storage standards',
          'Fuels Act 2022 - Modern regulatory framework for fuel sector',
          '',
          'POLICY OBJECTIVES:',
          '1. SECURITY OF SUPPLY',
          '   Ensure reliable electricity for all Bermuda residents and businesses.',
          '   Maintain fuel storage reserves sufficient for emergency supply.',
          '',
          '2. AFFORDABILITY',
          '   Keep electricity costs reasonable for households and businesses.',
          '   Promote energy efficiency to reduce overall consumption.',
          '',
          '3. SUSTAINABILITY',
          '   Transition to renewable energy and reduce fossil fuel dependency.',
          '   Support achievement of climate commitments.',
          '',
          '4. INNOVATION',
          '   Support new technologies and local energy sector development.',
          '   Enable distributed generation and energy storage.',
        ]
      },
      {
        title: 'ELECTRICITY ACT 2016 - KEY PROVISIONS',
        body: [
          'The Electricity Act 2016 establishes the modern regulatory framework:',
          '',
          'DISTRIBUTED GENERATION (DG):',
          'Authorises eligible customers to generate electricity on-site.',
          'Net metering framework enables export of excess generation to BELCO.',
          'Technical standards apply to all grid-connected systems.',
          '',
          'LICENSING:',
          'BELCO holds the primary licence to supply electricity in Bermuda.',
          'Independent power producers may apply for generation licences.',
          'The Regulatory Authority oversees compliance with licence conditions.',
          '',
          'CONSUMER PROTECTIONS:',
          'Quality of supply standards are defined in the Act.',
          'Dispute resolution mechanisms are provided for consumers.',
          'Consumers have the right to choose energy efficiency measures.',
          '',
          'RECENT DEVELOPMENTS:',
          'Airport Solar Farm (6 MW) - operational under DG provisions',
          '70 Electric Buses - Government fleet transition completed 2023',
          '14.3 MW DG target for 2025 - on track based on permit data',
        ]
      },
      {
        title: 'STAKEHOLDER ENGAGEMENT PROCESS',
        body: [
          'The Department of Energy conducts regular stakeholder consultations:',
          '',
          'PUBLIC CONSULTATIONS:',
          'Major policy changes are subject to a formal consultation period.',
          'Consultation notices are published at www.gov.bm.',
          'Typically 4-8 weeks for public submissions.',
          '',
          'HOW TO PARTICIPATE:',
          '1. Monitor www.gov.bm/energy for consultation announcements',
          '2. Submit written comments to the Department of Energy',
          '3. Attend public meetings (announced separately)',
          '4. Email responses to energy@gov.bm during consultation periods',
          '',
          'INDUSTRY LIAISON:',
          'The Department maintains ongoing dialogue with BELCO, installers,',
          'importers, environmental groups, and consumer representatives.',
          '',
          'CONTACT INFORMATION:',
          'Department of Energy',
          'Government Administration Building',
          '30 Parliament Street, Hamilton HM11, Bermuda',
          'Email: energy@gov.bm',
          'Tel: (441) 295-5151 ext. 1800',
          'Web: www.gov.bm/energy',
        ]
      }
    ]
  },
  'Energy': {
    intro: 'The Department of Energy provides comprehensive information on Bermuda\'s energy sector, including electricity supply, renewable energy programmes, energy efficiency initiatives, and policy developments affecting households and businesses across the island.',
    sections: [
      {
        title: 'BERMUDA ENERGY OVERVIEW',
        body: [
          'ELECTRICITY SUPPLY:',
          'BELCO (Bermuda Electric Light Company) is the sole electricity supplier.',
          'Generation is primarily from imported fuel oil with growing renewable share.',
          'Residential electricity rate: approximately $0.31-$0.38 per kWh.',
          '',
          'RENEWABLE ENERGY CAPACITY:',
          'Solar PV:        129 MW installed (772 active systems, 2019-2025)',
          'Airport Solar:   6 MW (commissioned 2017)',
          'Wind:            Small-scale installations island-wide',
          '',
          'ENERGY TRANSITION STATUS:',
          '1,767 electric vehicles registered (all categories, 2026)',
          '70 electric buses operating in public transit fleet',
          '14.3 MW distributed generation target for 2025',
          '',
          'For up-to-date statistics visit: www.gov.bm/energy',
        ]
      },
      {
        title: 'KEY PROGRAMMES AND INITIATIVES',
        body: [
          'SOLAR REBATE PROGRAMME (2010-present):',
          'Government rebates available for qualifying solar installations.',
          'Contact Department of Energy for current rebate levels and eligibility.',
          '',
          'DISTRIBUTED GENERATION (DG) PROGRAMME:',
          'Enables homeowners and businesses to install solar PV and micro-wind.',
          'Excess generation exported to BELCO grid at retail rate (net metering).',
          'DAPR planning permit required for all installations.',
          '',
          'ENERGY EFFICIENCY OUTREACH:',
          'Free energy guide publications for all households.',
          'LED lighting programmes in partnership with retailers.',
          'School education programme on energy and sustainability.',
          '',
          'EV INCENTIVE PROGRAMME:',
          'Duty concessions on private EV imports.',
          'Support for public EV charging infrastructure expansion.',
          '',
          'Contact: energy@gov.bm for details on any programme.',
        ]
      },
      {
        title: 'CONTACT AND FURTHER RESOURCES',
        body: [
          'DEPARTMENT OF ENERGY',
          'Government Administration Building',
          '30 Parliament Street, Hamilton HM11, Bermuda',
          '',
          'General Enquiries: energy@gov.bm',
          'Telephone: (441) 295-5151',
          'Website: www.gov.bm/energy',
          '',
          'ONLINE RESOURCES:',
          'Energy guides and publications: available on www.gov.bm/energy',
          'Policy documents and legislation: www.bermudalaws.bm',
          'Planning applications (DAPR): www.planning.gov.bm',
          'BELCO customer services: www.belco.bm',
          '',
          'EMERGENCY ENERGY CONTACTS:',
          'BELCO 24-hour fault reporting: (441) 295-5111',
          'Fuel import emergency: Contact Department of Energy',
          '',
          'Follow the Department of Energy on social media for news and updates.',
        ]
      }
    ]
  },
}

// ── PDF Page Builders ──────────────────────────────────────────────────────────
const DOE_GREEN = '0.22 0.42 0.22'
const DARK_GREEN = '0.14 0.30 0.14'

function headerBar(cmds) {
  cmds.push(`${DOE_GREEN} setrgbcolor`)
  cmds.push('0 742 612 50 re f')
  cmds.push('1 1 1 setrgbcolor')
  cmds.push('BT /F1 9 Tf 72 762 Td (GOVERNMENT OF BERMUDA  |  Department of Energy  |  www.gov.bm) Tj ET')
  cmds.push('0 0 0 setrgbcolor')
}

function footerBar(cmds, pageNum) {
  cmds.push(`${DOE_GREEN} setrgbcolor`)
  cmds.push('0 0 612 32 re f')
  cmds.push('1 1 1 setrgbcolor')
  cmds.push(`BT /F1 8 Tf 72 11 Td (Department of Energy  |  Government of Bermuda  |  energy@gov.bm  |  Page ${pageNum}) Tj ET`)
  cmds.push('0 0 0 setrgbcolor')
}

function sectionHeader(cmds, y, titleText) {
  cmds.push(`${DOE_GREEN} setrgbcolor`)
  cmds.push(`72 ${y - 3} 468 19 re f`)
  cmds.push('1 1 1 setrgbcolor')
  cmds.push('BT /F2 10 Tf')
  cmds.push(`76 ${y + 2} Td`)
  cmds.push(`(${ps(titleText)}) Tj`)
  cmds.push('ET')
  cmds.push('0 0 0 setrgbcolor')
  return y - 26
}

function buildPage1(title, category, dateStr, intro, section) {
  const cmds = []
  headerBar(cmds)

  // Title
  const tLines = wrap(title.toUpperCase(), 52)
  let y = 705
  cmds.push(`${DARK_GREEN} setrgbcolor`)
  cmds.push('BT /F2 17 Tf')
  cmds.push(`72 ${y} Td`)
  tLines.forEach((line, i) => {
    if (i > 0) cmds.push('0 -23 Td')
    cmds.push(`(${ps(line)}) Tj`)
    y -= 23
  })
  cmds.push('ET')
  cmds.push('0 0 0 setrgbcolor')

  y -= 10
  // Category + date bar
  cmds.push('0.95 0.97 0.95 setrgbcolor')
  cmds.push(`72 ${y - 4} 468 18 re f`)
  cmds.push('0 0 0 setrgbcolor')
  cmds.push('BT /F1 9 Tf')
  cmds.push(`76 ${y} Td`)
  cmds.push(`(Category: ${ps(category)}   |   Published: ${ps(dateStr)}   |   Issuing Authority: Department of Energy) Tj`)
  cmds.push('ET')
  y -= 22

  // Thin divider
  cmds.push('0.75 0.75 0.75 setrgbcolor')
  cmds.push(`72 ${y} 468 0.5 re f`)
  cmds.push('0 0 0 setrgbcolor')
  y -= 16

  // Intro heading
  cmds.push(`${DARK_GREEN} setrgbcolor`)
  cmds.push('BT /F2 11 Tf')
  cmds.push(`72 ${y} Td`)
  cmds.push('(Overview) Tj')
  cmds.push('ET')
  cmds.push('0 0 0 setrgbcolor')
  y -= 16

  const introLines = wrap(intro, 90)
  const maxIntroLines = Math.min(introLines.length, 5)
  cmds.push('BT /F1 10 Tf')
  cmds.push(`72 ${y} Td`)
  introLines.slice(0, maxIntroLines).forEach((line, i) => {
    if (i > 0) cmds.push('0 -14 Td')
    cmds.push(`(${ps(line)}) Tj`)
    y -= 14
  })
  cmds.push('ET')
  y -= 18

  if (section) {
    y = sectionHeader(cmds, y, section.title)
    const lines = section.body || []
    const maxLines = Math.min(lines.length, Math.floor((y - 50) / 14))
    if (maxLines > 0) {
      cmds.push('BT /F1 10 Tf')
      cmds.push(`72 ${y} Td`)
      lines.slice(0, maxLines).forEach((line, i) => {
        if (i > 0) cmds.push('0 -14 Td')
        const isHeading = line && line.match(/^[A-Z][A-Z &\/\-]{3,}:$/)
        if (isHeading) {
          cmds.push('ET')
          cmds.push(`${DARK_GREEN} setrgbcolor`)
          cmds.push('BT /F2 10 Tf')
          cmds.push(`72 ${y - (i > 0 ? 0 : 0)} Td`)
          cmds.push(`(${ps(line)}) Tj`)
          cmds.push('ET')
          cmds.push('0 0 0 setrgbcolor')
          cmds.push('BT /F1 10 Tf')
          cmds.push(`72 ${y} Td`)
          for (let k = 0; k < i; k++) cmds.push('0 -14 Td')
        } else {
          cmds.push(`(${ps(line)}) Tj`)
        }
        y -= 14
      })
      cmds.push('ET')
    }
  }

  footerBar(cmds, 1)
  return cmds.join('\n')
}

function buildPage2(title, dateStr, sections) {
  const cmds = []
  headerBar(cmds)

  // Continuation header
  cmds.push(`${DARK_GREEN} setrgbcolor`)
  cmds.push('BT /F2 11 Tf')
  cmds.push(`72 718 Td`)
  cmds.push(`(${ps(title.length > 60 ? title.slice(0, 57) + '...' : title)}) Tj`)
  cmds.push('ET')
  cmds.push('0 0 0 setrgbcolor')

  cmds.push('0.75 0.75 0.75 setrgbcolor')
  cmds.push('72 707 468 0.5 re f')
  cmds.push('0 0 0 setrgbcolor')

  let y = 695

  for (const section of sections) {
    if (!section) continue
    y = sectionHeader(cmds, y, section.title)
    const lines = section.body || []
    const maxLines = Math.min(lines.length, Math.floor((y - 50) / 14))
    if (maxLines > 0) {
      cmds.push('BT /F1 10 Tf')
      cmds.push(`72 ${y} Td`)
      let firstInBlock = true
      for (let i = 0; i < maxLines; i++) {
        const line = lines[i]
        if (!firstInBlock) cmds.push('0 -14 Td')
        cmds.push(`(${ps(line)}) Tj`)
        firstInBlock = false
        y -= 14
      }
      cmds.push('ET')
    }
    y -= 14
    if (y < 80) break
  }

  footerBar(cmds, 2)
  return cmds.join('\n')
}

// ── Multi-page PDF builder ─────────────────────────────────────────────────────
function buildMultiPagePDF(pageStreams) {
  const N = pageStreams.length
  // Object numbering:
  // 1 = Catalog, 2 = Pages
  // 3..3+N-1 = page objects
  // 3+N..3+2N-1 = content stream objects
  // 3+2N = Font /F1 (Helvetica)
  // 3+2N+1 = Font /F2 (Helvetica-Bold)
  const pageObjStart = 3
  const streamObjStart = 3 + N
  const fontF1 = 3 + 2 * N
  const fontF2 = 3 + 2 * N + 1
  const totalObjs = fontF2

  const objs = new Array(totalObjs + 1) // index 1..totalObjs

  // Obj 1: Catalog
  objs[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj'

  // Obj 2: Pages
  const kids = Array.from({ length: N }, (_, i) => `${pageObjStart + i} 0 R`).join(' ')
  objs[2] = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${N} >>\nendobj`

  // Page objects
  for (let i = 0; i < N; i++) {
    const pNum = pageObjStart + i
    const cNum = streamObjStart + i
    objs[pNum] = `${pNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${cNum} 0 R /Resources << /Font << /F1 ${fontF1} 0 R /F2 ${fontF2} 0 R >> >> >>\nendobj`
  }

  // Content stream objects
  for (let i = 0; i < N; i++) {
    const cNum = streamObjStart + i
    const stream = pageStreams[i]
    objs[cNum] = `${cNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`
  }

  // Fonts
  objs[fontF1] = `${fontF1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`
  objs[fontF2] = `${fontF2} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`

  // Assemble body and compute offsets
  const header = '%PDF-1.4\n'
  let body = ''
  const offsets = {}
  for (let i = 1; i <= totalObjs; i++) {
    offsets[i] = header.length + body.length
    body += objs[i] + '\n'
  }

  const xrefOffset = header.length + body.length
  let xref = `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= totalObjs; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'
  }
  xref += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return header + body + xref
}

// ── Public API ─────────────────────────────────────────────────────────────────
export function downloadMockDocument({ title, summary = '', category = 'Policy', content = '' }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  // Pick the best matching rich content set
  const rich = RICH[category] || RICH['Policy']
  const intro = summary || content || rich.intro

  const page1Stream = buildPage1(title, category, dateStr, intro, rich.sections[0])
  const page2Stream = buildPage2(title, dateStr, [rich.sections[1], rich.sections[2]])

  const pdfData = buildMultiPagePDF([page1Stream, page2Stream])

  const blob = new Blob([pdfData], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 72)}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function isExternalUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:'))
}
