/**
 * Registry of every editable image slot on the public website.
 *
 * Each entry becomes an upload slot in the CMS (Site Images screen). The public
 * site reads overrides from GET /api/site-images and merges them over the
 * bundled defaults, so uploading here replaces the image site-wide without a
 * redeploy.
 *
 *   key          matches a PAGE_IMAGES key in portal/src/constants/branding.js
 *   group        the screen/section it appears on (used to group the CMS UI)
 *   label        human name shown to CMS staff
 *   description  where exactly it appears
 *   defaultUrl   the image bundled with the build (shown until overridden)
 *   recommended  guidance on dimensions
 */

const B = '/images/';

// Shorthand: [key, label, description, defaultFile, recommended]
const GROUPS = {
  'Global / Branding': [
    ['logoPublic', 'Department of Energy lockup', 'The logo in the header and footer of every page', 'dept-of-energy-white.png', 'Wide lockup ~912×216, transparent PNG, white text (sits on a dark background)'],
    ['portrait', 'Generic portrait placeholder', 'Not currently displayed — spare headshot placeholder', 'portrait.jpg', '400×400 square'],
  ],

  'Home page': [
    ['solar', 'Solar — primary', 'Home, Energy and Dashboard — lead solar image', 'solar.jpg', '1200×800 landscape'],
    ['solarRooftop', 'Rooftop solar', 'Home — residential rooftop card', 'solar-rooftop.jpg', '800×600'],
    ['wind', 'Wind energy', 'Home and Renewable Dashboard — wind card', 'wind.jpg', '800×600'],
    ['battery', 'Battery storage', 'Home and Renewable Dashboard — storage card', 'battery-storage.jpg', '800×600'],
    ['balconySolar', 'Balcony solar', 'Home, Education and Projects — balcony solar pilot card', 'balcony-solar.jpg', '800×600'],
    ['hamiltonStreet', 'Hamilton street scene', 'Home, Bursary and news/policy cards — street-level imagery', 'hamilton-street.jpg', '800×600'],
    ['solarFieldBermuda', 'Solar field (Bermuda)', 'Renewable Dashboard, the About page’s “Sustainability” value card, plus news and project cards', 'solar-field-bermuda.jpg', '1200×800'],
  ],

  'About page': [
    ['home', 'About — “Our Mission” photo', 'About page, beside the “Our Mission” text. Currently a placeholder — upload a photograph to replace it.', 'placeholder-tbd.svg', '1200×800 landscape'],
    ['bermudaVision', 'About — “The Department Overview” photo', 'About page, the photo beside the “The Department Overview” text', 'bermuda-vision.webp', '1600×900'],
    ['government', 'Government building', 'About, Contact, Policies and Legal pages', 'government.jpg', '1200×800'],
    ['floatingSolar', 'Floating solar', 'Bursary categories, an education resource, and any project about floating solar', 'floating-solar.jpg', '800×600'],
    ['solarWorkers', 'About — “Transparency” value card', 'About value card, and the Installers page', 'solar-workers.jpg', '800×600'],
    ['bhcHousing', 'About — “Equity” value card', 'About value card, and the Simulator page', 'bhc-housing.jpg', '800×600'],
    ['portrait1', 'Leadership portrait 1', 'About → leadership team, position 1', 'portraits/774909.jpg', '400×400 square'],
    ['portrait2', 'Leadership portrait 2', 'About → leadership team, position 2', 'portraits/91227.jpg', '400×400 square'],
    ['portrait3', 'Leadership portrait 3', 'About → leadership team, position 3', 'portraits/1181519.jpg', '400×400 square'],
    ['portrait4', 'Leadership portrait 4', 'About → leadership team, position 4', 'portraits/1181686.jpg', '400×400 square'],
    ['portrait5', 'Leadership portrait 5', 'About → leadership team, position 5', 'portraits/1222271.jpg', '400×400 square'],
    ['portrait6', 'Leadership portrait 6', 'About → leadership team, position 6', 'portraits/2379004.jpg', '400×400 square'],
  ],

  'Energy section': [
    ['energy', 'Energy banner', 'Energy landing banner and News page cards', 'energy.jpg', '1600×900'],
    ['solarCommercial', 'Commercial solar', 'Commercial installations card', 'solar-commercial.jpg', '800×600'],
    ['grid', 'Electricity grid', 'Energy and Electronic Communications — infrastructure card', 'grid.jpg', '800×600'],
    ['efficiency', 'Energy efficiency', 'Efficiency programmes card', 'efficiency.jpg', '800×600'],
    ['transport', 'Transport', 'Transport section card', 'transport.jpg', '800×600'],
    ['ev', 'Electric vehicle', 'EV imagery across energy and dashboards', 'ev.jpg', '800×600'],
    ['charging', 'EV charging', 'Charging infrastructure — Vehicles page', 'charging.jpg', '800×600'],
    ['van', 'Electric van', 'Not currently displayed — spare vehicle image', 'van.jpg', '800×600'],
    ['bus', 'Public bus', 'Public transport card', 'bus.jpg', '800×600'],
    ['motorcycle', 'Electric motorcycle', 'Two-wheeler category card', 'motorcycle.jpg', '800×600'],
  ],

  'Electronic Communications': [
    ['telecom', 'Telecommunications', 'Banner for Electronic Communications and Broadcasting', 'telecom.jpg', '1600×900'],
    ['broadband', 'Broadband Expansion card', 'Electronic Communications — “Broadband Expansion” initiative card. Currently a placeholder — upload a photograph to replace it.', 'placeholder-tbd.svg', '800×600'],
  ],

  'Space & Satellite': [
    ['satellite', 'Satellite — primary', 'Space & Satellite landing banner, and an About value card', 'satellite.jpg', '1600×900'],
    ['spaceSatellites', 'Satellites in orbit', 'Space & Satellite banner, home card, space policy and project cards — used at several shapes, so keep the subject central', 'space-satellites.jpg', '1600×900'],
    ['space', 'Space — generic', 'Not currently displayed — spare space image', 'space.jpg', '1200×800'],
    ['spaceOrbit', 'Orbit', 'Orbital operations sub-page', 'space-orbit.jpg', '1200×800'],
    ['spaceDish', 'Ground station dish', 'Ground segment sub-page', 'space-dish.jpg', '1200×800'],
    ['spaceLaunch', 'Launch', 'Not displayed — the stock photo carries a launch company’s branding, replace before use', 'space-launch.jpg', '1280×720'],
    ['spaceEarth', 'Earth from space', 'Not currently displayed — spare space image', 'space-earth.jpg', '1200×800'],
    ['spaceInsurance', 'Space insurance', 'Space insurance sub-page — shown 16:9, so avoid a 3:2 crop', 'space-insurance.jpg', '1280×720'],
    ['spaceStrategy', 'Space strategy', 'Strategy sub-page', 'space-strategy.jpg', '1200×800'],
    ['spaceAstronaut', 'Astronaut', 'Human spaceflight sub-page', 'space-astronaut.jpg', '1200×800'],
    ['spaceNightsky', 'Night sky', 'Astronomy / night sky sub-page', 'space-nightsky.jpg', '1200×800'],
  ],

  'Policies & Consultations': [
    ['consultation', 'Consultation', 'Consultations list and policy cards', 'consultation.jpg', '1200×800'],
    ['policy', 'Policy banner', 'Not currently displayed — Policies uses the Government building image', 'consultation.jpg', '1600×900'],
  ],

  'Projects': [
    ['govSolarField', 'Government solar field', 'Projects list lead image', 'gov-solar-field.jpg', '1200×800'],
    ['dptElectrification', 'DPT electrification', 'Public transport electrification project', 'dpt-electrification.jpg', '800×600'],
  ],

  'Dashboards': [
    ['renewableDashboard', 'Renewable Dashboard tile', 'Dashboards page → Quick Access, the “Renewable Dashboard” tile', 'bermuda-energy-dashboard.png', '1200×900 (4:3 — the tile crops to 4:3)'],
    ['transitionDashboard', 'Transition Dashboard tile', 'Dashboards page → Quick Access, the “Transition Dashboard” tile', 'bermuda-energy-dashboard.png', '1200×900 (4:3 — the tile crops to 4:3)'],
    ['simulator', 'Energy simulator tile', 'Simulator promo tile on the dashboard', 'home.jpg', '800×600'],
    ['registry', 'Registry tile', 'Energy registry tile on the dashboard', 'registry.jpg', '800×600'],
    ['analytics', 'Analytics', 'Analytics / data imagery on transition dashboard', 'analytics.jpg', '800×600'],
    ['electricBus', 'Electric bus', 'Transition dashboard — bus electrification', 'electric-bus.jpg', '800×600'],
    ['electricBuses', 'Electric bus fleet', 'Fleet electrification imagery', 'electric-buses.jpg', '800×600'],
    ['evExpo', 'EV expo', 'EV adoption / events card', 'ev-expo.jpg', '800×600'],
    ['evFleetBermuda', 'EV fleet (Bermuda)', 'Local EV fleet imagery', 'ev-fleet-bermuda.jpg', '800×600'],
    ['bmw3', 'EV model photo', 'Vehicle model card', 'bmw-3.jpg', '800×600'],
    ['batteryRooms', 'Battery rooms', 'Grid-scale storage facility', 'battery-rooms.jpg', '800×600'],
    ['batteryStorage', 'Battery storage (alt)', 'Not currently displayed — duplicate of the Battery storage image', 'battery-storage.jpg', '800×600'],
    ['windTurbine', 'Wind turbine', 'Wind generation card', 'wind-turbine.jpg', '800×600'],
    ['dockyardSolar', 'Dockyard solar', 'Registry page banner and project card', 'dockyard-solar.jpg', '1200×800'],
  ],

  'GIS & Registry': [
    ['gisHeatmap', 'GIS Solar PV Map preview', 'Preview tile for the GIS Solar PV Map, on the Dashboards and Home pages', 'heat-gis.png', '1200×800'],
  ],

  'Education & Bursary': [
    ['education', 'Education banner', 'Bursary page banner and the Dashboard education tile', 'education.jpg', '1600×900'],
    ['educationOutreach', 'Education outreach', 'Education centre page, plus news and home cards', 'education-outreach.jpg', '800×600'],
    ['bursary', 'Bursary banner', 'Not currently displayed — Bursary uses the Education banner', 'bursary.jpg', '1600×900'],
    ['summerStudentPhoto', 'Summer student photo', 'Student programme news imagery', 'summer-student-photo.jpg', '800×600'],
  ],

  'Innovation': [
    ['innovation', 'Innovation banner', 'Innovation landing banner and Electronic Communications', 'innovation.jpg', '1600×900'],
    ['blockchain', 'Blockchain / digital', 'Digital currency and blockchain topic card', 'blockchain.jpg', '800×600'],
  ],

  'Contact & Errors': [
    ['contact', 'Contact banner', 'Contact page banner', 'bermuda.jpg', '1600×900'],
    ['bermuda', 'Bermuda scenery', 'Page-not-found (404) page', 'bermuda.jpg', '1200×800'],
  ],
};

const SITE_IMAGE_SLOTS = [];
let order = 0;
for (const [group, entries] of Object.entries(GROUPS)) {
  for (const [key, label, description, file, recommended] of entries) {
    SITE_IMAGE_SLOTS.push({
      key,
      group,
      label,
      description,
      defaultUrl: key === 'logoPublic' ? `/${file}` : `${B}${file}`,
      recommended,
      sortOrder: order++,
    });
  }
}

module.exports = { SITE_IMAGE_SLOTS };
