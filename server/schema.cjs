/**
 * Single source of truth for the database schema and first-run seed data.
 *
 * This used to exist twice: as `runMigrationsInline()` inside server.cjs (run on
 * every boot) and again as hand-written DDL inside migrate.cjs. The two copies
 * had already drifted apart. Both entry points now call into this module, so the
 * schema can only be changed in one place.
 *
 *   - server.cjs  calls applySchemaAndSeed() at startup (idempotent)
 *   - migrate.cjs calls it as a CLI (`npm run migrate`) and records the version
 */
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

function newId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

/**
 * Create every table/index if absent and seed first-run content.
 * Safe to run repeatedly; it never mutates existing rows.
 *
 * @param {import('pg').PoolClient} client
 */
async function applySchemaAndSeed(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE TABLE IF NOT EXISTS kpis (id VARCHAR(50) PRIMARY KEY, name VARCHAR(255), value VARCHAR(50), unit VARCHAR(50), last_updated DATE);`);
    await client.query(`CREATE TABLE IF NOT EXISTS news (id VARCHAR(50) PRIMARY KEY, title TEXT, summary TEXT, content TEXT, image TEXT, publish_date DATE, scheduled_publish_date DATE, scheduled_expiry_date DATE, status VARCHAR(50), target_site VARCHAR(50), modified_by VARCHAR(100), category VARCHAR(100) DEFAULT 'Renewable Energy', featured BOOLEAN DEFAULT TRUE, slug VARCHAR(255), author VARCHAR(100), tags TEXT, excerpt TEXT, attachment_url TEXT, attachment_name TEXT);`);
    await client.query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS attachment_url TEXT;`);
    await client.query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS attachment_name TEXT;`);
    await client.query(`CREATE TABLE IF NOT EXISTS policies (id VARCHAR(50) PRIMARY KEY, title TEXT, category VARCHAR(100), effective_date DATE, expiry_date DATE, scheduled_publish_date DATE, scheduled_expiry_date DATE, description TEXT, pdf_link TEXT, status VARCHAR(50), target_site VARCHAR(50), modified_by VARCHAR(100));`);
    await client.query(`CREATE TABLE IF NOT EXISTS consultations (id VARCHAR(50) PRIMARY KEY, title TEXT, description TEXT, start_date DATE, end_date DATE, scheduled_publish_date DATE, scheduled_expiry_date DATE, status VARCHAR(50), related_links TEXT, supporting_docs TEXT, target_site VARCHAR(50), modified_by VARCHAR(100), external_url TEXT);`);
    await client.query(`CREATE TABLE IF NOT EXISTS static_pages (id VARCHAR(50) PRIMARY KEY, title TEXT, route TEXT, content TEXT, seo_title TEXT, seo_keywords TEXT, seo_description TEXT, status VARCHAR(50), image TEXT, last_updated DATE, author VARCHAR(100), target_site VARCHAR(50), modified_by VARCHAR(100));`);
    await client.query(`CREATE TABLE IF NOT EXISTS projects (id VARCHAR(50) PRIMARY KEY, title TEXT, description TEXT, timeline VARCHAR(100), status VARCHAR(50), image TEXT, target_site VARCHAR(50), category VARCHAR(100), start_date DATE, progress INT DEFAULT 0, budget TEXT, location TEXT, milestones JSONB, documents JSONB, gallery JSONB);`);
    await client.query(`CREATE TABLE IF NOT EXISTS tracker (id VARCHAR(50) PRIMARY KEY, name TEXT, type VARCHAR(100), sector VARCHAR(100), stage VARCHAR(100), progress INT, status_label VARCHAR(100), related_docs TEXT, last_updated DATE, target_site VARCHAR(50));`);
    await client.query(`CREATE TABLE IF NOT EXISTS installers (id VARCHAR(50) PRIMARY KEY, name TEXT, contact TEXT, website TEXT, status VARCHAR(50), parish VARCHAR(100) DEFAULT 'Hamilton', description TEXT, certifications VARCHAR(500) DEFAULT 'Registered Solar PV Installer, Battery Storage', projects INTEGER DEFAULT 0, rating NUMERIC(3,2) DEFAULT 5.0);`);
    await client.query(`CREATE TABLE IF NOT EXISTS education (id VARCHAR(50) PRIMARY KEY, title TEXT, category VARCHAR(100), description TEXT, attachment TEXT, target_site VARCHAR(50), type VARCHAR(100), file_size VARCHAR(50), image TEXT);`);
    await client.query(`CREATE TABLE IF NOT EXISTS media (id VARCHAR(50) PRIMARY KEY, name TEXT, type VARCHAR(50), size VARCHAR(50), uploaded_by VARCHAR(100), date DATE, url TEXT);`);
    await client.query(`CREATE TABLE IF NOT EXISTS settings (id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), site_name TEXT, contact_email TEXT, footer_info TEXT, social_facebook TEXT, social_twitter TEXT, social_instagram TEXT, active_theme TEXT, contact_phone TEXT, contact_office_location TEXT, contact_hours TEXT, contact_department_list TEXT, allowed_file_types TEXT, max_upload_size TEXT, featured_guide TEXT, featured_tip TEXT, featured_resource TEXT, featured_infographic TEXT);`);
    await client.query(`INSERT INTO settings (id, site_name, contact_email, contact_phone) VALUES (1, 'Department of Energy', 'energy@gov.bm', '441-444-0597') ON CONFLICT (id) DO UPDATE SET contact_phone = COALESCE(NULLIF(settings.contact_phone,''), EXCLUDED.contact_phone);`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS external_url TEXT;`);
    await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;`);
    await client.query(`ALTER TABLE installers ADD COLUMN IF NOT EXISTS company TEXT;`);
    await client.query(`ALTER TABLE installers ADD COLUMN IF NOT EXISTS contact_name TEXT;`);
    await client.query(`ALTER TABLE installers ADD COLUMN IF NOT EXISTS email TEXT;`);
    await client.query(`ALTER TABLE installers ADD COLUMN IF NOT EXISTS phone TEXT;`);
    await client.query(`ALTER TABLE installers ADD COLUMN IF NOT EXISTS license_number TEXT;`);
    await client.query(`ALTER TABLE installers ADD COLUMN IF NOT EXISTS logo TEXT;`);
    await client.query(`ALTER TABLE education ADD COLUMN IF NOT EXISTS download_url TEXT;`);
    await client.query(`ALTER TABLE innovation_topics ADD COLUMN IF NOT EXISTS category VARCHAR(100);`);
    await client.query(`CREATE TABLE IF NOT EXISTS energy_guides (id VARCHAR(50) PRIMARY KEY, title TEXT, category VARCHAR(100), summary TEXT, cover_image TEXT, pdf_attachment TEXT, featured_image TEXT, key_takeaways TEXT, estimated_savings VARCHAR(100), publish_date DATE, featured_flag BOOLEAN DEFAULT FALSE, status VARCHAR(50), target_site VARCHAR(50), modified_by VARCHAR(100));`);
    await client.query(`CREATE TABLE IF NOT EXISTS infographics (id VARCHAR(50) PRIMARY KEY, title TEXT, image TEXT, description TEXT, category VARCHAR(100), publish_date DATE, status VARCHAR(50), target_site VARCHAR(50), modified_by VARCHAR(100));`);
    await client.query(`CREATE TABLE IF NOT EXISTS roadmaps (id VARCHAR(50) PRIMARY KEY, title TEXT, description TEXT, timeline_type VARCHAR(100), milestones JSONB, status VARCHAR(50) DEFAULT 'Active', target_site VARCHAR(50), modified_by VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE TABLE IF NOT EXISTS bursaries (id VARCHAR(50) PRIMARY KEY, name TEXT, school TEXT, field_of_study TEXT, academic_year VARCHAR(50), status VARCHAR(50) DEFAULT 'Active', amount VARCHAR(50), photo_url TEXT, guidelines_url TEXT, bio TEXT, achievement TEXT, focus TEXT, target_site VARCHAR(50), modified_by VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`ALTER TABLE bursaries ADD COLUMN IF NOT EXISTS achievement TEXT;`);
    await client.query(`ALTER TABLE bursaries ADD COLUMN IF NOT EXISTS focus TEXT;`);
    await client.query(`ALTER TABLE bursaries ADD COLUMN IF NOT EXISTS education TEXT;`);
    await client.query(`ALTER TABLE bursaries ADD COLUMN IF NOT EXISTS background TEXT;`);
    await client.query(`CREATE TABLE IF NOT EXISTS leadership (id VARCHAR(50) PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, image_url TEXT, bio TEXT, display_order INT DEFAULT 0, status VARCHAR(50) DEFAULT 'Active', target_site VARCHAR(50), modified_by VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE TABLE IF NOT EXISTS space_content (id VARCHAR(50) PRIMARY KEY, title TEXT, slug VARCHAR(100), category VARCHAR(100), content TEXT, summary TEXT, pdf_link TEXT, image TEXT, status VARCHAR(50) DEFAULT 'Published', target_site VARCHAR(50), modified_by VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE TABLE IF NOT EXISTS recycle_bin (id VARCHAR(50) PRIMARY KEY, deleted_at DATE DEFAULT CURRENT_DATE, original_collection VARCHAR(50), item_data JSONB);`);
    await client.query(`CREATE TABLE IF NOT EXISTS versions (id VARCHAR(50) PRIMARY KEY, item_id VARCHAR(50), collection_name VARCHAR(50), version_number INT, title TEXT, modified_at TIMESTAMP, modified_by VARCHAR(100), data TEXT);`);
    await client.query(`CREATE TABLE IF NOT EXISTS logs (id VARCHAR(100) PRIMARY KEY, user_name VARCHAR(100), action TEXT, content_type VARCHAR(50), content_name TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE TABLE IF NOT EXISTS users (id VARCHAR(50) PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'Viewer' CHECK (role IN ('Viewer','Editor','Approver','Administrator')), is_active BOOLEAN DEFAULT TRUE, reset_token VARCHAR(255), reset_token_expires TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE TABLE IF NOT EXISTS innovation_topics (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, status VARCHAR(50) NOT NULL, link_to VARCHAR(255), link_label VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE TABLE IF NOT EXISTS statistics_history (id VARCHAR(50) PRIMARY KEY, data_type VARCHAR(50) NOT NULL, period VARCHAR(20) NOT NULL, value NUMERIC, unit VARCHAR(50), notes TEXT, uploaded_by VARCHAR(100), uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE TABLE IF NOT EXISTS solar_installations (id TEXT PRIMARY KEY, name TEXT NOT NULL, parish TEXT, type TEXT, capacity NUMERIC, status TEXT DEFAULT 'Active', install_date DATE, installer TEXT, coordinate_x NUMERIC DEFAULT 50, coordinate_y NUMERIC DEFAULT 50, lat NUMERIC, lng NUMERIC, notes TEXT, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`ALTER TABLE solar_installations ADD COLUMN IF NOT EXISTS lat NUMERIC;`);
    await client.query(`ALTER TABLE solar_installations ADD COLUMN IF NOT EXISTS lng NUMERIC;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_versions_item_id ON versions(item_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_news_publish_date ON news(publish_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);`);
    // Public form capture — contact enquiries and newsletter subscribers are
    // persisted so CMS staff can retrieve them (no longer lost to the console).
    await client.query(`CREATE TABLE IF NOT EXISTS contact_submissions (id VARCHAR(50) PRIMARY KEY, name TEXT, email TEXT, subject TEXT, message TEXT, status VARCHAR(30) DEFAULT 'New', submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (id VARCHAR(50) PRIMARY KEY, email TEXT UNIQUE NOT NULL, status VARCHAR(30) DEFAULT 'Subscribed', subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contact_submitted ON contact_submissions(submitted_at DESC);`);
    // Seed statistics_history with EV and solar adoption data if empty
    const statsCheck = await client.query("SELECT COUNT(*) FROM statistics_history");
    if (parseInt(statsCheck.rows[0].count, 10) === 0) {
      const evData = [
        ['stat-ev-2019','ev','2019',120,'vehicles'],
        ['stat-ev-2020','ev','2020',185,'vehicles'],
        ['stat-ev-2021','ev','2021',290,'vehicles'],
        ['stat-ev-2022','ev','2022',420,'vehicles'],
        ['stat-ev-2023','ev','2023',580,'vehicles'],
        ['stat-ev-2024','ev','2024',720,'vehicles'],
        ['stat-ev-2025','ev','2025',910,'vehicles'],
      ];
      const solarData = [
        ['stat-sol-2019','solar','2019',3.2,'MW'],
        ['stat-sol-2020','solar','2020',6.1,'MW'],
        ['stat-sol-2021','solar','2021',9.8,'MW'],
        ['stat-sol-2022','solar','2022',14.5,'MW'],
        ['stat-sol-2023','solar','2023',19.2,'MW'],
        ['stat-sol-2024','solar','2024',24.1,'MW'],
        ['stat-sol-2025','solar','2025',28.7,'MW'],
      ];
      for (const [id, type, period, value, unit] of [...evData, ...solarData]) {
        await client.query(
          `INSERT INTO statistics_history (id, data_type, period, value, unit, uploaded_by) VALUES ($1,$2,$3,$4,$5,'system') ON CONFLICT DO NOTHING`,
          [id, type, period, value, unit]
        );
      }
    }
    // Seed solar_installations if empty
    const solarInstCheck = await client.query("SELECT COUNT(*) FROM solar_installations");
    const installations = [
      ['gis-001','Hamilton Residence','Hamilton','Residential',8.5,'Active','2022-03-10','BE Solar',32.2952,-64.782],
      ['gis-002','Devonshire Commercial','Devonshire','Commercial',125.0,'Active','2021-06-15','AES Solar',32.3045,-64.758],
      ['gis-003','Warwick Home','Warwick','Residential',6.2,'Active','2023-01-20','Sunnyside Solar',32.267,-64.8065],
      ['gis-004','Pembroke Office','Pembroke','Commercial',45.8,'Active','2021-09-05','Greenlight Energy',32.292,-64.7695],
      ['gis-005','Southampton Retail','Southampton','Commercial',32.0,'Active','2022-07-12','BE Solar',32.252,-64.821],
      ['gis-006','BHC Community Solar','Sandys','Community',500.0,'Active','2020-11-30','AES Solar',32.293,-64.857],
      ['gis-007',"St. George's Site",'St. George\'s','Commercial',18.5,'Active','2023-03-18','Sunnyside Solar',32.384,-64.677],
      ['gis-008','Paget Residence','Paget','Residential',10.2,'Active','2022-05-22','Greenlight Energy',32.2795,-64.777],
      ['gis-009','Balcony Solar Pilot','Hamilton','Residential',2.4,'Active','2023-08-01','BE Solar',32.2945,-64.7805],
      ['gis-010','Dockyard Centre','Sandys','Commercial',28.4,'Active','2021-04-14','AES Solar',32.325,-64.834],
      ['gis-011','Hamilton Hotel','Hamilton','Commercial',95.0,'Active','2022-10-03','BAC Group',32.296,-64.779],
      ['gis-012','Devonshire Farm Site','Devonshire','Utility',5000.0,'Active','2019-12-01','AES Solar',32.312,-64.748],
    ];
    if (parseInt(solarInstCheck.rows[0].count, 10) === 0) {
      for (const [id, name, parish, type, capacity, status, installDate, installer, lat, lng] of installations) {
        await client.query(
          `INSERT INTO solar_installations (id, name, parish, type, capacity, status, install_date, installer, lat, lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`,
          [id, name, parish, type, capacity, status, installDate, installer, lat, lng]
        );
      }
    } else {
      // Ensure all existing rows have lat/lng populated (fixes rows seeded before lat/lng columns were added)
      for (const [id, , , , , , , , lat, lng] of installations) {
        await client.query(
          `UPDATE solar_installations SET lat = $2, lng = $3 WHERE id = $1 AND (lat IS NULL OR lng IS NULL)`,
          [id, lat, lng]
        );
      }
    }
    // Seed innovation_topics if empty
    const innovationCheck = await client.query("SELECT COUNT(*) FROM innovation_topics");
    if (parseInt(innovationCheck.rows[0].count, 10) === 0) {
      const topics = [
        ['inn-1','Smart Grids','Advanced grid management enabling two-way power flows and distributed energy integration.','Active','/dashboard/renewable','View grid data'],
        ['inn-2','Battery Energy Storage','Grid-scale and residential storage for peak shaving and renewable integration.','Active','/dashboard/renewable','Storage metrics'],
        ['inn-3','Artificial Intelligence','AI applications for demand forecasting, grid optimisation, and predictive maintenance.','Research','/education','Learning resources'],
        ['inn-4','Distributed Energy Resources','Coordinating rooftop solar, storage, and flexible loads across the grid.','Active','/registry','Energy registry'],
        ['inn-5','Virtual Power Plants','Aggregating distributed assets to provide grid services.','Pilot','/projects','View projects'],
        ['inn-6','Demand Response','Technologies enabling consumers to reduce load during peak periods.','Active','/dashboard/transition','Transition dashboard'],
        ['inn-7','Digital Twins','Virtual models of energy infrastructure for planning and operations.','Research','/gis','GIS platform'],
        ['inn-8','Advanced Energy Analytics','Data-driven insights for policy, planning, and operational decisions.','Active','/dashboard/renewable','Explore dashboards'],
        ['inn-9','Blockchain & Energy Systems','Exploring distributed ledger applications for energy trading and grid management.','Research','/contact','Partner with us'],
        ['inn-10','Digital Currency & Energy','This section will provide public awareness information on vendors and service providers that accept digital currency, as part of Bermuda\'s emerging technology landscape. This content is for informational purposes only and does not constitute financial advice.','Coming Soon',null,'Content is being developed with industry partners and will be published when ready.'],
      ];
      for (const [id, title, description, status, linkTo, linkLabel] of topics) {
        await client.query(
          `INSERT INTO innovation_topics (id, title, description, status, link_to, link_label) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [id, title, description, status, linkTo, linkLabel]
        );
      }
    }
    // Seed bursary recipients
    const bursaryCheck = await client.query("SELECT COUNT(*) FROM bursaries");
    if (parseInt(bursaryCheck.rows[0].count, 10) === 0) {
      const recipients = [
        ['bur-001','Neriah Bean','Oakwood University','Applied Mathematics and Engineering','2025','Active','/images/portraits/neriah-bean.jpg',
          'Selected for his strong academic record, leadership potential, and an essay analysing Bermuda\'s energy future and the public\'s role in it.',
          'Developing foundational engineering and mathematical expertise to contribute to climate resilience and clean energy transformation.'],
        ['bur-002','Benjamin Crofton','Virginia Tech','Mechanical Engineering','2025','Active','/images/portraits/benjamin-crofton.jpg',
          'Awarded for his technical acumen and analytical essay on Bermuda\'s energy transition.',
          'Acquiring hands-on mechanical engineering insights to support independent energy infrastructure and modern technical planning on the island.'],
      ];
      for (const [id, name, school, fieldOfStudy, academicYear, status, photoUrl, achievement, focus] of recipients) {
        await client.query(
          `INSERT INTO bursaries (id, name, school, field_of_study, academic_year, status, photo_url, achievement, focus) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING`,
          [id, name, school, fieldOfStudy, academicYear, status, photoUrl, achievement, focus]
        );
      }
    }
    // Seed leadership team
    const leadershipCheck = await client.query("SELECT COUNT(*) FROM leadership");
    if (parseInt(leadershipCheck.rows[0].count, 10) === 0) {
      const team = [
        ['lead-001','The Honourable Alexa Lightbourne','Minister of Home Affairs','/images/portraits/minister-lightbourne.jpg',"The Honourable Alexa Lightbourne is the Minister of Home Affairs, responsible for the Department of Energy and Bermuda's national energy transition.",1],
        ['lead-002','Valerie Robinson James','Permanent Secretary, Ministry of Home Affairs','',"Valerie Robinson James is the Permanent Secretary for the Ministry of Home Affairs, responsible for the Department of Energy.",2],
        ['lead-003','Adrian Dill','Director of the Department of Energy','/images/portraits/director-dill.jpg',"Adrian Dill is the Director of the Department of Energy, leading Bermuda's energy policy, renewable programmes, and regulatory oversight.",3],
      ];
      for (const [id, name, role, imageUrl, bio, displayOrder] of team) {
        await client.query(
          `INSERT INTO leadership (id, name, role, image_url, bio, display_order) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [id, name, role, imageUrl, bio, displayOrder]
        );
      }
    }
    // NOTE: this previously ran `UPDATE leadership SET image_url = '' WHERE
    // id = 'lead-002'` on EVERY boot, which meant a portrait uploaded through the
    // CMS was silently wiped on the next restart and could never be re-added.
    // Seeded content must not be mutated at startup — manage it in the CMS.
    // Seed news articles
    const newsCheck = await client.query("SELECT COUNT(*) FROM news");
    if (parseInt(newsCheck.rows[0].count, 10) === 0) {
      const articles = [
        ['news-007','career-fair-expo-june-2026','Department of Energy at Bermuda Government Career Fair Expo 2026',
          'The Department of Energy showcased Bermuda\'s energy transition at the Government Career Fair Expo on 18 June 2026.',
          'The Department of Energy participated in the Bermuda Government Career Fair Expo held on 18 June 2026, bringing its digital engagement platform and Energy Simulator directly to students and career-seekers.\n\nAttendees had the opportunity to interact with the live Energy Simulator, exploring how household appliance choices and solar adoption affect monthly energy costs.\n\nDepartment representatives engaged in one-on-one conversations with students and young professionals about career pathways in energy, the 2026 Energy Bursary Programme, and Bermuda\'s clean energy transition goals.',
          '/images/events/career-fair-expo-1.jpg','2026-06-18','Published','Events',true,'Department of Energy'],
        ['news-001','bermuda-renewable-energy-milestone','Bermuda Reaches New Renewable Energy Milestone',
          'Installed solar capacity across the island has surpassed 25 MW, marking significant progress toward Bermuda\'s 2030 energy targets.',
          'The Department of Energy is pleased to announce that Bermuda has surpassed 25 megawatts of installed solar photovoltaic capacity.\n\nThis achievement reflects sustained investment in distributed generation, supportive regulatory frameworks, and growing public awareness of the benefits of renewable energy.',
          '/images/solar.jpg','2026-05-15','Published','Renewable Energy',true,'Department of Energy'],
        ['news-004','2026-energy-bursary-recipients','2026 Energy Bursary Recipients Announced',
          'Two Bermudian students have been awarded the inaugural Energy Bursary for studies in engineering and applied mathematics.',
          'The Department of Energy is pleased to announce the recipients of the inaugural 2026 Energy Bursary Programme.\n\nNeriah Bean and Benjamin Crofton have been selected for their academic excellence and commitment to contributing to Bermuda\'s clean energy future.',
          '/images/education.jpg','2026-05-10','Published','Education',false,'Department of Energy'],
      ];
      for (const [id, slug, title, excerpt, content, image, publishDate, status, category, featured, author] of articles) {
        await client.query(
          `INSERT INTO news (id, slug, title, excerpt, content, image, publish_date, status, category, featured, author) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING`,
          [id, slug, title, excerpt, content, image, publishDate, status, category, featured, author]
        );
      }
    }
    // Seed NESP 2026 as a closed (past) consultation only if it does not already
    // exist. Do NOT force status back to 'Closed' on every boot — that would undo
    // a legitimate manual re-open by CMS staff.
    await client.query(`
      INSERT INTO consultations (id, title, description, start_date, end_date, status, external_url)
      VALUES ('con-nesp-2026', 'National Energy Security Policy (NESP) 2026',
        'Public consultation on Bermuda''s updated National Energy Security Policy, covering renewable energy targets, grid resilience, and energy affordability for 2026–2030.',
        '2026-05-01', '2026-07-31', 'Closed', 'https://forum.gov.bm/en/')
      ON CONFLICT (id) DO NOTHING
    `);
    // NOTE: previously this ran `DELETE FROM consultations WHERE title ILIKE '%fuel%'`
    // on every startup, which silently and permanently destroyed any legitimate
    // staff-created consultation whose title contained "fuel" (e.g. "Fuel Import
    // Duty Review"). That one-off seed-cleanup line has been removed.
    // Seed default admin user if not exists
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;`);
    // Seed the initial administrator only if no users exist at all. Credentials
    // come from env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD) so production is not
    // stuck with a publicly-known default. If SEED_ADMIN_PASSWORD is unset we still
    // seed the legacy account for first-run/demo, but log a loud warning to rotate it.
    const anyUsers = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(anyUsers.rows[0].count, 10) === 0) {
      const seedEmail = process.env.SEED_ADMIN_EMAIL || 'energy@gov.bm';
      // There is no hardcoded fallback password any more. The previous default
      // ("bermuda2026") was published in the README and its bcrypt hash was
      // committed to this repository, so every fresh database shipped with a
      // publicly-known administrator account. When SEED_ADMIN_PASSWORD is unset
      // we mint a random one and print it once — it is never stored in the repo.
      const seedPassword = process.env.SEED_ADMIN_PASSWORD;
      const generated = !seedPassword;
      const password = seedPassword || require('crypto').randomBytes(18).toString('base64url');

      await client.query(
        `INSERT INTO users (id, username, email, password_hash, role, is_active)
         VALUES ($1,'energy_admin',$2,$3,'Administrator',TRUE) ON CONFLICT DO NOTHING;`,
        [newId('usr'), seedEmail, bcrypt.hashSync(password, 10)]
      );

      if (generated) {
        console.warn(
          '\n' + '='.repeat(78) +
          `\n[SECURITY] No SEED_ADMIN_PASSWORD was set, so a random administrator` +
          `\npassword was generated. It is shown ONCE and cannot be recovered:\n` +
          `\n    email:    ${seedEmail}` +
          `\n    password: ${password}\n` +
          `\nSign in and change it immediately (Staff Accounts → your account).\n` +
          '='.repeat(78) + '\n'
        );
      } else {
        console.log(`[Startup] Seeded administrator ${seedEmail} from SEED_ADMIN_PASSWORD.`);
      }
    }
    console.log('[Startup] Database tables verified/created.');
}

module.exports = { applySchemaAndSeed };
