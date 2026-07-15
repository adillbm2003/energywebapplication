const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Honor DATABASE_URL + SSL exactly like db.cjs. Managed Postgres (RDS/Heroku)
// typically only provides DATABASE_URL; without this branch `node migrate.cjs`
// silently connected to localhost/cms_energy_bm (the discrete-var defaults) or
// failed the TLS handshake — migrating the wrong database or erroring out.
const sslConfig = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
  ? { rejectUnauthorized: false }
  : false;
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: sslConfig })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'cms_energy_bm',
      ssl: sslConfig,
    });

// Helper to convert camelCase keys to snake_case for the database columns
function camelToSnakeKey(key) {
  if (key === 'user') return 'user_name';
  return key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Check if environment is production
const isProduction = process.env.NODE_ENV === 'production';

// List of all migrations in order
const migrations = [
  {
    version: 1,
    name: 'create_initial_schema',
    up: async (client) => {
      console.log("Migration 1: Creating initial schema tables (if not exist)...");
      
      // KPIs
      await client.query(`
        CREATE TABLE IF NOT EXISTS kpis (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255),
          value VARCHAR(50),
          unit VARCHAR(50),
          last_updated DATE
        );
      `);

      // News
      await client.query(`
        CREATE TABLE IF NOT EXISTS news (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          summary TEXT,
          content TEXT,
          image TEXT,
          publish_date DATE,
          scheduled_publish_date DATE,
          scheduled_expiry_date DATE,
          status VARCHAR(50),
          target_site VARCHAR(50),
          modified_by VARCHAR(100),
          category VARCHAR(100) DEFAULT 'Renewable Energy',
          featured BOOLEAN DEFAULT TRUE
        );
      `);

      // Policies
      await client.query(`
        CREATE TABLE IF NOT EXISTS policies (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          category VARCHAR(100),
          effective_date DATE,
          expiry_date DATE,
          scheduled_publish_date DATE,
          scheduled_expiry_date DATE,
          description TEXT,
          pdf_link TEXT,
          status VARCHAR(50),
          target_site VARCHAR(50),
          modified_by VARCHAR(100)
        );
      `);

      // Consultations
      await client.query(`
        CREATE TABLE IF NOT EXISTS consultations (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          description TEXT,
          start_date DATE,
          end_date DATE,
          scheduled_publish_date DATE,
          scheduled_expiry_date DATE,
          status VARCHAR(50),
          related_links TEXT,
          supporting_docs TEXT,
          target_site VARCHAR(50),
          modified_by VARCHAR(100)
        );
      `);

      // Static Pages
      await client.query(`
        CREATE TABLE IF NOT EXISTS static_pages (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          route TEXT,
          content TEXT,
          seo_title TEXT,
          seo_keywords TEXT,
          seo_description TEXT,
          status VARCHAR(50),
          image TEXT,
          last_updated DATE,
          author VARCHAR(100),
          target_site VARCHAR(50),
          modified_by VARCHAR(100)
        );
      `);

      // Projects
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          description TEXT,
          timeline VARCHAR(100),
          status VARCHAR(50),
          image TEXT,
          target_site VARCHAR(50)
        );
      `);

      // Tracker
      await client.query(`
        CREATE TABLE IF NOT EXISTS tracker (
          id VARCHAR(50) PRIMARY KEY,
          name TEXT,
          type VARCHAR(100),
          sector VARCHAR(100),
          stage VARCHAR(100),
          progress INT,
          status_label VARCHAR(100),
          related_docs TEXT,
          last_updated DATE,
          target_site VARCHAR(50)
        );
      `);

      // Installers
      await client.query(`
        CREATE TABLE IF NOT EXISTS installers (
          id VARCHAR(50) PRIMARY KEY,
          name TEXT,
          contact TEXT,
          website TEXT,
          status VARCHAR(50),
          parish VARCHAR(100) DEFAULT 'Hamilton',
          description TEXT,
          certifications VARCHAR(500) DEFAULT 'Registered Solar PV Installer, Battery Storage',
          projects INTEGER DEFAULT 0,
          rating NUMERIC(3, 2) DEFAULT 5.0
        );
      `);

      // Education
      await client.query(`
        CREATE TABLE IF NOT EXISTS education (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          category VARCHAR(100),
          description TEXT,
          attachment TEXT,
          target_site VARCHAR(50)
        );
      `);

      // Media
      await client.query(`
        CREATE TABLE IF NOT EXISTS media (
          id VARCHAR(50) PRIMARY KEY,
          name TEXT,
          type VARCHAR(50),
          size VARCHAR(50),
          uploaded_by VARCHAR(100),
          date DATE,
          url TEXT
        );
      `);

      // Settings
      await client.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
          site_name TEXT,
          contact_email TEXT,
          footer_info TEXT,
          social_facebook TEXT,
          social_twitter TEXT,
          social_instagram TEXT,
          active_theme TEXT,
          contact_phone TEXT,
          contact_office_location TEXT,
          contact_hours TEXT,
          contact_department_list TEXT,
          allowed_file_types TEXT,
          max_upload_size TEXT,
          featured_guide TEXT,
          featured_tip TEXT,
          featured_resource TEXT,
          featured_infographic TEXT
        );
      `);

      // Energy Guides
      await client.query(`
        CREATE TABLE IF NOT EXISTS energy_guides (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          category VARCHAR(100),
          summary TEXT,
          cover_image TEXT,
          pdf_attachment TEXT,
          featured_image TEXT,
          key_takeaways TEXT,
          estimated_savings VARCHAR(100),
          publish_date DATE,
          featured_flag BOOLEAN DEFAULT FALSE,
          status VARCHAR(50),
          target_site VARCHAR(50),
          modified_by VARCHAR(100)
        );
      `);

      // Infographics
      await client.query(`
        CREATE TABLE IF NOT EXISTS infographics (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          image TEXT,
          description TEXT,
          category VARCHAR(100),
          publish_date DATE
        );
      `);

      // Roadmaps
      await client.query(`
        CREATE TABLE IF NOT EXISTS roadmaps (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          description TEXT,
          timeline_type VARCHAR(100),
          milestones JSONB
        );
      `);

      // Bursaries
      await client.query(`
        CREATE TABLE IF NOT EXISTS bursaries (
          id VARCHAR(50) PRIMARY KEY,
          name TEXT,
          school TEXT,
          field_of_study TEXT,
          academic_year VARCHAR(50),
          status VARCHAR(50),
          amount VARCHAR(50),
          photo_url TEXT,
          guidelines_url TEXT,
          bio TEXT,
          target_site VARCHAR(50),
          modified_by VARCHAR(100)
        );
      `);

      // Space Content
      await client.query(`
        CREATE TABLE IF NOT EXISTS space_content (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          category VARCHAR(100),
          content TEXT,
          pdf_link TEXT,
          status VARCHAR(50),
          target_site VARCHAR(50),
          modified_by VARCHAR(100)
        );
      `);

      // Recycle Bin
      await client.query(`
        CREATE TABLE IF NOT EXISTS recycle_bin (
          id VARCHAR(50) PRIMARY KEY,
          deleted_at DATE DEFAULT CURRENT_DATE,
          original_collection VARCHAR(50),
          item_data JSONB
        );
      `);

      // Versions
      await client.query(`
        CREATE TABLE IF NOT EXISTS versions (
          id VARCHAR(50) PRIMARY KEY,
          item_id VARCHAR(50),
          collection_name VARCHAR(50),
          version_number INT,
          title TEXT,
          modified_at TIMESTAMP,
          modified_by VARCHAR(100),
          data TEXT
        );
      `);

      // Logs
      await client.query(`
        CREATE TABLE IF NOT EXISTS logs (
          id VARCHAR(100) PRIMARY KEY,
          user_name VARCHAR(100),
          action TEXT,
          content_type VARCHAR(50),
          content_name TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_versions_item_id ON versions(item_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_news_publish_date ON news(publish_date DESC);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);`);

      // Seeding database only if empty
      const settingsCheck = await client.query('SELECT COUNT(*) FROM settings');
      const count = parseInt(settingsCheck.rows[0].count, 10);
      if (count === 0) {
        console.log("Seeding data from db.json since database is empty...");
        const dbPath = path.join(__dirname, 'db.json');
        if (!fs.existsSync(dbPath)) {
          throw new Error(`db.json file not found at ${dbPath}`);
        }

        const rawData = fs.readFileSync(dbPath, 'utf8');
        const dbData = JSON.parse(rawData);

        // Seed settings
        if (dbData.settings) {
          console.log("Seeding settings table...");
          const record = dbData.settings;
          const keys = Object.keys(record);
          const dbKeys = keys.map(k => camelToSnakeKey(k));
          const placeholders = keys.map((_, i) => `$${i + 2}`).join(', ');
          const values = keys.map(key => {
            const val = record[key];
            return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
          });

          const queryText = `
            INSERT INTO settings (id, ${dbKeys.join(', ')})
            VALUES ($1, ${placeholders})
            ON CONFLICT (id) DO NOTHING;
          `;
          await client.query(queryText, [1, ...values]);
        }

        // Helper function to insert array of records dynamically
        const tableMapping = {
          kpis: 'kpis',
          news: 'news',
          policies: 'policies',
          consultations: 'consultations',
          staticPages: 'static_pages',
          projects: 'projects',
          tracker: 'tracker',
          installers: 'installers',
          education: 'education',
          media: 'media',
          energyGuides: 'energy_guides',
          infographics: 'infographics',
          roadmaps: 'roadmaps',
          bursaries: 'bursaries',
          spaceContent: 'space_content',
          recycleBin: 'recycle_bin',
          versions: 'versions',
          logs: 'logs'
        };

        for (const [jsonKey, tableName] of Object.entries(tableMapping)) {
          const records = dbData[jsonKey];
          if (!records || !Array.isArray(records) || records.length === 0) continue;

          console.log(`Seeding table "${tableName}" with ${records.length} records...`);
          for (const record of records) {
            const keys = Object.keys(record);
            const dbKeys = keys.map(k => camelToSnakeKey(k));
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const values = keys.map(key => {
              let val = record[key];
              if (val === '') {
                const snakeK = camelToSnakeKey(key);
                if (['expiry_date', 'pdf_link', 'pdf_attachment', 'photo_url', 'guidelines_url'].includes(snakeK)) {
                  return null;
                }
              }
              return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
            });

            const queryText = `
              INSERT INTO ${tableName} (${dbKeys.join(', ')})
              VALUES (${placeholders})
              ON CONFLICT (id) DO NOTHING;
            `;
            await client.query(queryText, values);
          }
        }
      } else {
        console.log("Database already contains data. Skipping default seeding.");
      }
    },
    down: async (client) => {
      if (isProduction) {
        throw new Error("Catastrophic Action Prevented: DROP TABLE is strictly prohibited in production.");
      }
      console.log("Migration 1 rollback: Dropping all tables (Non-Production)...");
      const tables = [
        'kpis', 'news', 'policies', 'consultations', 'static_pages', 
        'projects', 'tracker', 'installers', 'education', 'media', 
        'settings', 'energy_guides', 'infographics', 'roadmaps', 
        'bursaries', 'space_content', 'recycle_bin', 'versions', 'logs'
      ];
      for (const table of tables) {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      }
    }
  },
  {
    version: 2,
    name: 'create_users_table',
    up: async (client) => {
      console.log("Migration 2: Creating users table...");
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'Viewer' CHECK (role IN ('Viewer', 'Editor', 'Approver', 'Administrator')),
          is_active BOOLEAN DEFAULT TRUE,
          reset_token VARCHAR(255),
          reset_token_expires TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed default admin user: energy@gov.bm / bermuda2026
      const userCheck = await client.query("SELECT COUNT(*) FROM users WHERE email = 'energy@gov.bm'");
      if (parseInt(userCheck.rows[0].count, 10) === 0) {
        console.log("Seeding default admin user...");
        await client.query(`
          INSERT INTO users (id, username, email, password_hash, role, is_active)
          VALUES (
            'usr-admin',
            'energy_admin',
            'energy@gov.bm',
            '$2b$10$go00jDF64O/N3vkCzB.0kOv/Y2050sltz5sY.XsRFPIP50KjTtylu',
            'Administrator',
            TRUE
          );
        `);
      }
    },
    down: async (client) => {
      if (isProduction) {
        throw new Error("Catastrophic Action Prevented: DROP TABLE is strictly prohibited in production.");
      }
      console.log("Migration 2 rollback: Dropping users table...");
      await client.query("DROP TABLE IF EXISTS users CASCADE;");
    }
  },
  {
    version: 3,
    name: 'create_innovation_topics_table',
    up: async (client) => {
      console.log("Migration 3: Creating innovation_topics table...");
      await client.query(`
        CREATE TABLE IF NOT EXISTS innovation_topics (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(50) NOT NULL,
          link_to VARCHAR(255),
          link_label VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const topicCheck = await client.query("SELECT COUNT(*) FROM innovation_topics");
      if (parseInt(topicCheck.rows[0].count, 10) === 0) {
        console.log("Seeding default innovation topics...");
        const seedTopics = [
          ['inn-1', 'Smart Grids', 'Advanced grid management enabling two-way power flows and distributed energy integration.', 'Active', '/dashboard', 'View grid data'],
          ['inn-2', 'Battery Energy Storage', 'Grid-scale and residential storage for peak shaving and renewable integration.', 'Active', '/dashboard', 'Storage metrics'],
          ['inn-3', 'Artificial Intelligence', 'AI applications for demand forecasting, grid optimisation, and predictive maintenance.', 'Research', '/education', 'Learning resources'],
          ['inn-4', 'Distributed Energy Resources', 'Coordinating rooftop solar, storage, and flexible loads across the grid.', 'Active', '/registry', 'Energy registry'],
          ['inn-5', 'Virtual Power Plants', 'Aggregating distributed assets to provide grid services.', 'Pilot', '/projects', 'View projects'],
          ['inn-6', 'Demand Response', 'Technologies enabling consumers to reduce load during peak periods.', 'Active', '/transition-dashboard', 'Transition dashboard'],
          ['inn-7', 'Digital Twins', 'Virtual models of energy infrastructure for planning and operations.', 'Research', '/gis', 'GIS platform'],
          ['inn-8', 'Advanced Energy Analytics', 'Data-driven insights for policy, planning, and operational decisions.', 'Active', '/dashboard', 'Explore dashboards'],
          ['inn-9', 'Blockchain & Energy Systems', 'Exploring distributed ledger applications for energy trading and grid management.', 'Research', '/contact', 'Partner with us'],
          ['inn-10', 'Digital Currency & Energy', 'This section will provide public awareness information on vendors and service providers that accept digital currency, as part of Bermuda\'s emerging technology landscape. This content is for informational purposes only and does not constitute financial advice.', 'Coming Soon', null, 'Content is being developed with industry partners and will be published when ready.']
        ];

        for (const topic of seedTopics) {
          await client.query(
            `INSERT INTO innovation_topics (id, title, description, status, link_to, link_label) VALUES ($1, $2, $3, $4, $5, $6)`,
            topic
          );
        }
      }
    },
    down: async (client) => {
      if (isProduction) {
        throw new Error("Catastrophic Action Prevented: DROP TABLE is strictly prohibited in production.");
      }
      console.log("Migration 3 rollback: Dropping innovation_topics table...");
      await client.query("DROP TABLE IF EXISTS innovation_topics CASCADE;");
    }
  },
  {
    version: 4,
    name: 'add_external_url_and_statistics_history',
    up: async (client) => {
      console.log("Migration 4: Adding external_url to consultations and statistics_history table...");

      // Add external_url to consultations (for Citizens Forum links)
      await client.query(`
        ALTER TABLE consultations ADD COLUMN IF NOT EXISTS external_url TEXT;
      `);

      // Statistics history table for monthly TCD (EV) and Planning (Solar) uploads
      await client.query(`
        CREATE TABLE IF NOT EXISTS statistics_history (
          id VARCHAR(50) PRIMARY KEY,
          data_type VARCHAR(50) NOT NULL,
          period VARCHAR(20) NOT NULL,
          value NUMERIC,
          unit VARCHAR(50),
          notes TEXT,
          uploaded_by VARCHAR(100),
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_stats_history_type ON statistics_history(data_type);
        CREATE INDEX IF NOT EXISTS idx_stats_history_period ON statistics_history(period DESC);
      `);

      // Media approval status column
      await client.query(`
        ALTER TABLE media ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Approved';
        ALTER TABLE media ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100);
        ALTER TABLE media ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
        ALTER TABLE media ADD COLUMN IF NOT EXISTS description TEXT;
      `);
    },
    down: async (client) => {
      if (isProduction) {
        throw new Error("Catastrophic Action Prevented: DROP TABLE is strictly prohibited in production.");
      }
      console.log("Migration 4 rollback...");
      await client.query("ALTER TABLE consultations DROP COLUMN IF EXISTS external_url;");
      await client.query("DROP TABLE IF EXISTS statistics_history CASCADE;");
      await client.query("ALTER TABLE media DROP COLUMN IF EXISTS status;");
      await client.query("ALTER TABLE media DROP COLUMN IF EXISTS approved_by;");
      await client.query("ALTER TABLE media DROP COLUMN IF EXISTS approved_at;");
      await client.query("ALTER TABLE media DROP COLUMN IF EXISTS description;");
    }
  },
  {
    version: 5,
    name: 'create_solar_installations_table',
    up: async (client) => {
      console.log("Migration 5: Creating solar_installations table...");
      await client.query(`
        CREATE TABLE IF NOT EXISTS solar_installations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          parish TEXT,
          type TEXT,
          capacity NUMERIC,
          status TEXT DEFAULT 'Active',
          install_date DATE,
          installer TEXT,
          coordinate_x NUMERIC DEFAULT 50,
          coordinate_y NUMERIC DEFAULT 50,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);
    },
    down: async (client) => {
      if (isProduction) {
        throw new Error("Catastrophic Action Prevented: DROP TABLE is strictly prohibited in production.");
      }
      console.log("Migration 5 rollback: Dropping solar_installations table...");
      await client.query("DROP TABLE IF EXISTS solar_installations CASCADE;");
    }
  },
  {
    version: 6,
    name: 'create_missing_content_tables',
    up: async (client) => {
      console.log("Migration 6: Creating bursaries, space_content, energy_guides, infographics, roadmaps tables...");

      await client.query(`
        CREATE TABLE IF NOT EXISTS bursaries (
          id VARCHAR(50) PRIMARY KEY,
          name TEXT,
          school TEXT,
          field_of_study TEXT,
          academic_year VARCHAR(50),
          status VARCHAR(50) DEFAULT 'Active',
          amount VARCHAR(50),
          photo_url TEXT,
          guidelines_url TEXT,
          bio TEXT,
          target_site VARCHAR(50),
          modified_by VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS space_content (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          slug VARCHAR(100),
          category VARCHAR(100),
          content TEXT,
          summary TEXT,
          pdf_link TEXT,
          image TEXT,
          status VARCHAR(50) DEFAULT 'Published',
          target_site VARCHAR(50),
          modified_by VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS energy_guides (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          category VARCHAR(100),
          summary TEXT,
          cover_image TEXT,
          pdf_attachment TEXT,
          featured_image TEXT,
          key_takeaways TEXT,
          estimated_savings VARCHAR(100),
          publish_date DATE,
          featured_flag BOOLEAN DEFAULT FALSE,
          status VARCHAR(50) DEFAULT 'Published',
          target_site VARCHAR(50),
          modified_by VARCHAR(100)
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS infographics (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          image TEXT,
          description TEXT,
          category VARCHAR(100),
          publish_date DATE,
          status VARCHAR(50) DEFAULT 'Published',
          target_site VARCHAR(50),
          modified_by VARCHAR(100)
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS roadmaps (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT,
          description TEXT,
          timeline_type VARCHAR(100),
          milestones JSONB,
          status VARCHAR(50) DEFAULT 'Active',
          target_site VARCHAR(50),
          modified_by VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    },
    down: async (client) => {
      if (isProduction) {
        throw new Error("Catastrophic Action Prevented: DROP TABLE is strictly prohibited in production.");
      }
      console.log("Migration 6 rollback: Dropping content tables...");
      await client.query("DROP TABLE IF EXISTS bursaries CASCADE;");
      await client.query("DROP TABLE IF EXISTS space_content CASCADE;");
      await client.query("DROP TABLE IF EXISTS energy_guides CASCADE;");
      await client.query("DROP TABLE IF EXISTS infographics CASCADE;");
      await client.query("DROP TABLE IF EXISTS roadmaps CASCADE;");
    }
  }
];

async function runMigration() {
  const client = await pool.connect();
  try {
    // 1. Create migration version tracking table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check command line arguments
    const args = process.argv.slice(2);
    const isRollback = args[0] === 'rollback';

    // Get applied migrations
    const res = await client.query('SELECT version FROM schema_migrations ORDER BY version ASC');
    const appliedVersions = res.rows.map(r => r.version);

    if (isRollback) {
      if (appliedVersions.length === 0) {
        console.log("No migrations to roll back.");
        return;
      }
      const lastVersion = appliedVersions[appliedVersions.length - 1];
      const migrationToRollback = migrations.find(m => m.version === lastVersion);
      
      if (!migrationToRollback) {
        throw new Error(`Migration version ${lastVersion} not found in runner migrations definition.`);
      }

      console.log(`Starting rollback of migration version ${lastVersion} (${migrationToRollback.name})...`);
      
      await client.query('BEGIN');
      try {
        await migrationToRollback.down(client);
        await client.query('DELETE FROM schema_migrations WHERE version = $1', [lastVersion]);
        await client.query('COMMIT');
        console.log(`Successfully rolled back migration version ${lastVersion}!`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Rollback failed for migration ${lastVersion}. Transaction rolled back.`, err);
        throw err;
      }
    } else {
      console.log("Starting PostgreSQL non-destructive migrations run...");
      for (const migration of migrations) {
        if (appliedVersions.includes(migration.version)) {
          console.log(`Migration ${migration.version} (${migration.name}) already applied. Skipping.`);
          continue;
        }

        console.log(`Applying migration ${migration.version} (${migration.name})...`);
        await client.query('BEGIN');
        try {
          await migration.up(client);
          await client.query(
            'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
            [migration.version, migration.name]
          );
          await client.query('COMMIT');
          console.log(`Successfully applied migration ${migration.version}!`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`Migration failed at version ${migration.version}. Transaction rolled back.`, err);
          throw err;
        }
      }
      console.log("All migrations checked and up to date!");
    }
  } catch (err) {
    console.error("Migration execution failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
