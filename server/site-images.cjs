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
    ['logoPublic', 'Government crest', 'Header and footer crest across every page', 'bermuda-crest-colour.png', '200×200 PNG, transparent'],
    ['portrait', 'Generic portrait placeholder', 'Fallback headshot when a person has no photo', 'portrait.jpg', '400×400 square'],
  ],

  'Home page': [
    ['home', 'Home hero', 'Main hero banner at the top of the home page', 'home.jpg', '1600×900 landscape'],
    ['solar', 'Solar — primary', 'Lead solar image used on home and energy sections', 'solar.jpg', '1200×800 landscape'],
    ['solarRooftop', 'Rooftop solar', 'Residential rooftop card', 'solar-rooftop.jpg', '800×600'],
    ['wind', 'Wind energy', 'Wind card on home and renewable dashboard', 'wind.jpg', '800×600'],
    ['battery', 'Battery storage', 'Battery storage card', 'battery-storage.jpg', '800×600'],
    ['bhcHousing', 'BHC housing', 'Housing project spotlight', 'bhc-housing.jpg', '800×600'],
    ['balconySolar', 'Balcony solar', 'Balcony solar pilot card', 'balcony-solar.jpg', '800×600'],
    ['solarWorkers', 'Solar installers at work', 'Workforce / installers imagery', 'solar-workers.jpg', '800×600'],
    ['hamiltonStreet', 'Hamilton street scene', 'Community / street-level imagery', 'hamilton-street.jpg', '800×600'],
    ['solarFieldBermuda', 'Solar field (Bermuda)', 'Utility-scale solar field, used widely', 'solar-field-bermuda.jpg', '1200×800'],
  ],

  'About page': [
    ['bermudaVision', 'Bermuda vision banner', 'Vision section banner on About', 'bermuda-vision.webp', '1600×900'],
    ['government', 'Government building', 'Government / official imagery on About, Policies, Contact', 'government.jpg', '1200×800'],
    ['floatingSolar', 'Floating solar', 'Innovation imagery on About', 'floating-solar.jpg', '800×600'],
    ['portrait1', 'Leadership portrait 1', 'About → leadership team, position 1', 'portraits/774909.jpg', '400×400 square'],
    ['portrait2', 'Leadership portrait 2', 'About → leadership team, position 2', 'portraits/91227.jpg', '400×400 square'],
    ['portrait3', 'Leadership portrait 3', 'About → leadership team, position 3', 'portraits/1181519.jpg', '400×400 square'],
    ['portrait4', 'Leadership portrait 4', 'About → leadership team, position 4', 'portraits/1181686.jpg', '400×400 square'],
    ['portrait5', 'Leadership portrait 5', 'About → leadership team, position 5', 'portraits/1222271.jpg', '400×400 square'],
    ['portrait6', 'Leadership portrait 6', 'About → leadership team, position 6', 'portraits/2379004.jpg', '400×400 square'],
  ],

  'Energy section': [
    ['energy', 'Energy banner', 'Energy landing page banner', 'energy.jpg', '1600×900'],
    ['solarCommercial', 'Commercial solar', 'Commercial installations card', 'solar-commercial.jpg', '800×600'],
    ['grid', 'Electricity grid', 'Grid infrastructure card', 'grid.jpg', '800×600'],
    ['efficiency', 'Energy efficiency', 'Efficiency programmes card', 'efficiency.jpg', '800×600'],
    ['transport', 'Transport', 'Transport section card', 'transport.jpg', '800×600'],
    ['ev', 'Electric vehicle', 'EV imagery across energy and dashboards', 'ev.jpg', '800×600'],
    ['charging', 'EV charging', 'Charging infrastructure — Vehicles page', 'charging.jpg', '800×600'],
    ['van', 'Electric van', 'Commercial vehicle card', 'van.jpg', '800×600'],
    ['bus', 'Public bus', 'Public transport card', 'bus.jpg', '800×600'],
    ['motorcycle', 'Electric motorcycle', 'Two-wheeler category card', 'motorcycle.jpg', '800×600'],
  ],

  'Electronic Communications': [
    ['telecom', 'Telecommunications', 'Banner for Electronic Communications and Broadcasting', 'telecom.jpg', '1600×900'],
  ],

  'Space & Satellite': [
    ['satellite', 'Satellite — primary', 'Space & Satellite landing banner', 'satellite.jpg', '1600×900'],
    ['spaceSatellites', 'Satellites in orbit', 'Satellite constellation imagery', 'space-satellites.jpg', '1200×800'],
    ['space', 'Space — generic', 'General space imagery', 'space.jpg', '1200×800'],
    ['spaceOrbit', 'Orbit', 'Orbital operations sub-page', 'space-orbit.jpg', '1200×800'],
    ['spaceDish', 'Ground station dish', 'Ground segment sub-page', 'space-dish.jpg', '1200×800'],
    ['spaceLaunch', 'Launch', 'Launch services sub-page', 'space-launch.jpg', '1200×800'],
    ['spaceEarth', 'Earth from space', 'Earth observation sub-page', 'space-earth.jpg', '1200×800'],
    ['spaceInsurance', 'Space insurance', 'Space insurance sub-page', 'space-insurance.jpg', '1200×800'],
    ['spaceStrategy', 'Space strategy', 'Strategy sub-page', 'space-strategy.jpg', '1200×800'],
    ['spaceAstronaut', 'Astronaut', 'Human spaceflight sub-page', 'space-astronaut.jpg', '1200×800'],
    ['spaceNightsky', 'Night sky', 'Astronomy / night sky sub-page', 'space-nightsky.jpg', '1200×800'],
  ],

  'Policies & Consultations': [
    ['consultation', 'Consultation', 'Consultations list and policy cards', 'consultation.jpg', '1200×800'],
    ['policy', 'Policy banner', 'Policies landing banner', 'consultation.jpg', '1600×900'],
  ],

  'Projects': [
    ['govSolarField', 'Government solar field', 'Projects list lead image', 'gov-solar-field.jpg', '1200×800'],
    ['dptElectrification', 'DPT electrification', 'Public transport electrification project', 'dpt-electrification.jpg', '800×600'],
  ],

  'Dashboards': [
    ['bermudaEnergyDashboard', 'Dashboard hero', 'Dashboard landing banner', 'bermuda-energy-dashboard.png', '1600×900'],
    ['simulator', 'Energy simulator tile', 'Simulator promo tile on the dashboard', 'home.jpg', '800×600'],
    ['registry', 'Registry tile', 'Energy registry tile on the dashboard', 'registry.jpg', '800×600'],
    ['analytics', 'Analytics', 'Analytics / data imagery on transition dashboard', 'analytics.jpg', '800×600'],
    ['electricBus', 'Electric bus', 'Transition dashboard — bus electrification', 'electric-bus.jpg', '800×600'],
    ['electricBuses', 'Electric bus fleet', 'Fleet electrification imagery', 'electric-buses.jpg', '800×600'],
    ['evExpo', 'EV expo', 'EV adoption / events card', 'ev-expo.jpg', '800×600'],
    ['evFleetBermuda', 'EV fleet (Bermuda)', 'Local EV fleet imagery', 'ev-fleet-bermuda.jpg', '800×600'],
    ['bmw3', 'EV model photo', 'Vehicle model card', 'bmw-3.jpg', '800×600'],
    ['batteryRooms', 'Battery rooms', 'Grid-scale storage facility', 'battery-rooms.jpg', '800×600'],
    ['batteryStorage', 'Battery storage (alt)', 'Alternate battery storage image', 'battery-storage.jpg', '800×600'],
    ['windTurbine', 'Wind turbine', 'Wind generation card', 'wind-turbine.jpg', '800×600'],
    ['dockyardSolar', 'Dockyard solar', 'Registry page banner and project card', 'dockyard-solar.jpg', '1200×800'],
  ],

  'GIS & Registry': [
    ['gisHeatmap', 'GIS heat map preview', 'Preview image for the GIS heat map', 'heat-gis.png', '1200×800'],
  ],

  'Education & Bursary': [
    ['education', 'Education banner', 'Education centre banner', 'education.jpg', '1600×900'],
    ['educationOutreach', 'Education outreach', 'Outreach and schools imagery', 'education-outreach.jpg', '800×600'],
    ['bursary', 'Bursary banner', 'Energy Bursary programme banner', 'bursary.jpg', '1600×900'],
    ['summerStudentPhoto', 'Summer student photo', 'Student programme news imagery', 'summer-student-photo.jpg', '800×600'],
  ],

  'Innovation': [
    ['innovation', 'Innovation banner', 'Innovation landing banner', 'innovation.jpg', '1600×900'],
    ['blockchain', 'Blockchain / digital', 'Digital currency and blockchain topic card', 'blockchain.jpg', '800×600'],
  ],

  'Contact & Errors': [
    ['contact', 'Contact banner', 'Contact page banner', 'bermuda.jpg', '1600×900'],
    ['bermuda', 'Bermuda scenery', 'Used on the 404 page and general scenery', 'bermuda.jpg', '1200×800'],
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
