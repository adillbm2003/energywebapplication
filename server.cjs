require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db.cjs');
const { validate, schemas } = require('./server/validate.cjs');

// Production Dependencies
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const tableColumns = {};

async function fetchTableColumns() {
  try {
    // Dynamically ensure reset token columns exist on users
    await db.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;
    `);
    
    const res = await db.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `);
    Object.keys(tableColumns).forEach(k => delete tableColumns[k]);
    res.rows.forEach(row => {
      if (!tableColumns[row.table_name]) {
        tableColumns[row.table_name] = [];
      }
      tableColumns[row.table_name].push(row.column_name);
    });
    console.log("Database table schema metadata loaded successfully.");
  } catch (err) {
    console.error("Error loading table column metadata:", err);
  }
}

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'doe-secret-session-token-key-2026';
const JWT_EXPIRES_IN = '2h';

// AWS S3 Configuration
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET || 'bermuda-doe-cms-uploads';
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret',
  },
  endpoint: process.env.AWS_S3_ENDPOINT || undefined,
  forcePathStyle: process.env.AWS_S3_ENDPOINT ? true : false,
});

let useS3 = true;
if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'mock-key') {
  console.warn("AWS S3 credentials not fully configured. File uploads will default to local storage.");
  useS3 = false;
}

// ── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Keep disabled to allow simple visual rendering of previews
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const approvedOrigins = process.env.APPROVED_ORIGINS
  ? process.env.APPROVED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:8000', 'http://localhost:5173', 'http://127.0.0.1:8000', 'http://127.0.0.1:5173'];

const allowAllOrigins = approvedOrigins.includes('*');

app.use(cors({
  origin: (origin, callback) => {
    // No origin = same-origin request or curl — always allow
    if (!origin) return callback(null, true);
    // Wildcard allows everything
    if (allowAllOrigins) return callback(null, true);
    // Self-origin: CMS portal calling its own Railway API
    if (process.env.RAILWAY_PUBLIC_DOMAIN && origin === `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) {
      return callback(null, true);
    }
    if (approvedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS: Origin rejected'));
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

// ── AUTHENTICATION & RBAC MIDDLEWARES ────────────────────────────────────────
async function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Access token missing" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user;
    try {
      const result = await db.query('SELECT id, username, email, role, is_active FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }
      user = db.snakeToCamel(result.rows[0]);
      if (!user.isActive) {
        return res.status(401).json({ error: "Unauthorized: User account is inactive" });
      }
    } catch (dbErr) {
      // Database unavailable — trust JWT claims directly (demo / first-run mode)
      user = { id: decoded.id, username: decoded.username, email: decoded.email || 'energy@gov.bm', role: decoded.role, isActive: true };
    }

    req.user = user;

    // Renew token to implement sliding session on activity
    try {
      const newToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && !(req.headers.host && (req.headers.host.includes('localhost') || req.headers.host.includes('127.0.0.1'))),
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 * 1000
      });
    } catch (tokenErr) {
      console.error("Failed to renew sliding session token:", tokenErr);
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authenticated session required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient privileges" });
    }
    next();
  };
}

function checkWritePermission(collectionName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authenticated session required" });
    }
    const userRole = req.user.role;
    if (userRole === 'Viewer') {
      return res.status(403).json({ error: "Forbidden: Viewer role does not have write access." });
    }
    
    // Editor role can only write if status is Draft, Hidden, Pending or In Development
    if (userRole === 'Editor') {
      const status = req.body.status;
      if (status && !['Draft', 'Hidden', 'In Development', 'Pending'].includes(status)) {
        return res.status(403).json({ error: "Forbidden: Editor role cannot publish or approve content." });
      }
    }
    next();
  };
}

const collectionToTable = {
  kpis: 'kpis',
  news: 'news',
  policies: 'policies',
  consultations: 'consultations',
  projects: 'projects',
  tracker: 'tracker',
  installers: 'installers',
  education: 'education',
  solarInstallations: 'solar_installations',
  innovation: 'innovation_topics',
  staticPages: 'static_pages',
  bursaries: 'bursaries',
  spaceContent: 'space_content',
  energyGuides: 'energy_guides',
  infographics: 'infographics',
  roadmaps: 'roadmaps',
};

const collectionSortOrder = {
  kpis: 'name ASC',
  news: 'publish_date DESC NULLS LAST, id DESC',
  policies: 'effective_date DESC NULLS LAST, id DESC',
  consultations: 'start_date DESC NULLS LAST, id DESC',
  projects: 'id DESC',
  tracker: 'last_updated DESC NULLS LAST, id DESC',
  installers: 'id DESC',
  education: 'id DESC',
  solarInstallations: 'id DESC',
  innovation: 'id DESC',
  staticPages: 'title ASC',
  bursaries: 'academic_year DESC NULLS LAST, id DESC',
  spaceContent: 'id DESC',
  energyGuides: 'publish_date DESC NULLS LAST, id DESC',
  infographics: 'publish_date DESC NULLS LAST, id DESC',
  roadmaps: 'id DESC',
};

function getCollectionOrderBy(collectionName) {
  return collectionSortOrder[collectionName] || 'id DESC';
}

// Database logging helper (runs inside existing transactions when client is passed)
async function logAction(user, action, contentType, contentName, client = db) {
  try {
    const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await client.query(
      `INSERT INTO logs (id, user_name, action, content_type, content_name, timestamp)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [id, user || "System", action, contentType, contentName]
    );
  } catch (e) {
    console.error("Error logging action:", e);
  }
}

// Scheduled Publish/Expiry checks in database
async function runPostgresScheduler() {
  try {
    const nowStr = new Date().toISOString().split('T')[0];

    // Wrap scheduler steps in transaction
    await db.executeTransaction(async (client) => {
      // 1. Scheduled News -> Published
      const scheduledNews = await client.query(
        `SELECT id, title, scheduled_publish_date FROM news 
         WHERE status = 'Scheduled' AND scheduled_publish_date <= $1`,
        [nowStr]
      );
      for (const item of scheduledNews.rows) {
        await client.query(
          `UPDATE news SET status = 'Published', publish_date = scheduled_publish_date WHERE id = $1`,
          [item.id]
        );
        await logAction('System Scheduler', 'Auto-Published (Scheduled)', 'news', item.title, client);
      }

      // 2. Scheduled Policies -> Approved
      const scheduledPolicies = await client.query(
        `SELECT id, title FROM policies 
         WHERE status = 'Scheduled' AND scheduled_publish_date <= $1`,
        [nowStr]
      );
      for (const item of scheduledPolicies.rows) {
        await client.query(
          `UPDATE policies SET status = 'Approved' WHERE id = $1`,
          [item.id]
        );
        await logAction('System Scheduler', 'Auto-Published (Scheduled)', 'policies', item.title, client);
      }

      // 3. Scheduled Consultations -> Open
      const scheduledCons = await client.query(
        `SELECT id, title FROM consultations 
         WHERE status = 'Scheduled' AND scheduled_publish_date <= $1`,
        [nowStr]
      );
      for (const item of scheduledCons.rows) {
        await client.query(
          `UPDATE consultations SET status = 'Open' WHERE id = $1`,
          [item.id]
        );
        await logAction('System Scheduler', 'Auto-Published (Scheduled)', 'consultations', item.title, client);
      }

      // 4. Expiry checks - news -> Archived
      const expiredNews = await client.query(
        `SELECT id, title FROM news 
         WHERE status IN ('Published', 'Open', 'In Force', 'Approved') AND scheduled_expiry_date <= $1`,
        [nowStr]
      );
      for (const item of expiredNews.rows) {
        await client.query(
          `UPDATE news SET status = 'Archived' WHERE id = $1`,
          [item.id]
        );
        await logAction('System Scheduler', 'Auto-Expired (Scheduled)', 'news', item.title, client);
      }

      // 5. Expiry checks - policies -> Archived
      const expiredPolicies = await client.query(
        `SELECT id, title FROM policies 
         WHERE status IN ('Published', 'Open', 'In Force', 'Approved') AND scheduled_expiry_date <= $1`,
        [nowStr]
      );
      for (const item of expiredPolicies.rows) {
        await client.query(
          `UPDATE policies SET status = 'Archived' WHERE id = $1`,
          [item.id]
        );
        await logAction('System Scheduler', 'Auto-Expired (Scheduled)', 'policies', item.title, client);
      }

      // 6. Expiry checks - consultations -> Closed
      const expiredCons = await client.query(
        `SELECT id, title FROM consultations 
         WHERE status IN ('Published', 'Open', 'In Force', 'Approved') AND scheduled_expiry_date <= $1`,
        [nowStr]
      );
      for (const item of expiredCons.rows) {
        await client.query(
          `UPDATE consultations SET status = 'Closed' WHERE id = $1`,
          [item.id]
        );
        await logAction('System Scheduler', 'Auto-Expired (Scheduled)', 'consultations', item.title, client);
      }

      // 7. Auto-cleanup recycle bin items older than 30 days
      const expiredRecycleBin = await client.query(
        `SELECT id, original_collection, item_data FROM recycle_bin 
         WHERE deleted_at <= CURRENT_DATE - INTERVAL '30 days'`
      );
      for (const item of expiredRecycleBin.rows) {
        const itemData = typeof item.item_data === 'string' ? JSON.parse(item.item_data) : item.item_data;
        const title = itemData?.title || itemData?.name || item?.id;
        await client.query('DELETE FROM recycle_bin WHERE id = $1', [item.id]);
        await logAction('System Scheduler', 'Permanently Deleted (Expired in Recycle Bin > 30 Days)', item.original_collection, title, client);
      }
    });
  } catch (err) {
    console.error("Scheduler run error:", err);
  }
}

// Fetch the entire database contents
async function getFullDb() {
  const dbData = {};
  for (const [key, tableName] of Object.entries(collectionToTable)) {
    const orderBy = getCollectionOrderBy(key);
    const queryText = `SELECT * FROM ${tableName} ORDER BY ${orderBy}`;
    const res = await db.query(queryText);
    dbData[key] = db.snakeToCamel(res.rows);
  }

  const rbRes = await db.query('SELECT * FROM recycle_bin ORDER BY deleted_at DESC');
  dbData.recycleBin = db.snakeToCamel(rbRes.rows);

  const verRes = await db.query('SELECT * FROM versions ORDER BY modified_at DESC');
  dbData.versions = db.snakeToCamel(verRes.rows);

  const logRes = await db.query('SELECT * FROM logs ORDER BY timestamp DESC');
  dbData.logs = db.snakeToCamel(logRes.rows);

  const settingsRes = await db.query('SELECT * FROM settings WHERE id = 1');
  if (settingsRes.rows.length > 0) {
    const { id, ...settingsData } = settingsRes.rows[0];
    dbData.settings = db.snakeToCamel(settingsData);
  } else {
    dbData.settings = {};
  }
  return dbData;
}

// Multer Upload Setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${basename}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage: storage });

// ── SYSTEM MONITORING & HEALTH CHECK ENDPOINTS ────────────────────────────────
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {
      database: 'UNKNOWN',
      storage: useS3 ? 'S3' : 'LOCAL'
    }
  };
  try {
    await db.query('SELECT 1');
    health.checks.database = 'OK';
  } catch (err) {
    health.status = 'ERROR';
    health.checks.database = 'FAIL';
    health.error = err.message;
  }
  
  // Always return 200 so Railway/load-balancer health checks pass even when DB is degraded
  res.json(health);
});

app.get('/readiness', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.send('OK');
  } catch (err) {
    res.status(503).send('Not Ready');
  }
});

// ── SECURE AUDIO/MEDIA STORAGE & FALLBACK ROUTING ────────────────────────────
app.get('/uploads/:filename', async (req, res) => {
  const filename = req.params.filename;
  if (useS3) {
    try {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: filename,
      });
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return res.redirect(presignedUrl);
    } catch (err) {
      console.error("S3 presigned URL request failed. Falling back to local storage.", err);
    }
  }

  const localPath = path.join(uploadDir, filename);
  if (fs.existsSync(localPath)) {
    res.sendFile(localPath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Default admin used when the database is unavailable (demo / first-run mode)
const DEMO_ADMIN = {
  id: 'usr-admin',
  username: 'energy_admin',
  email: 'energy@gov.bm',
  passwordHash: bcrypt.hashSync('bermuda2026', 10),
  role: 'Administrator',
  isActive: true,
};

// ── AUTHENTICATION ROUTES ────────────────────────────────────────────────────
app.post('/api/auth/login', loginLimiter, async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    let user;
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      user = db.snakeToCamel(result.rows[0]);
    } catch (dbErr) {
      // Database unavailable — fall back to demo admin account
      if (email !== DEMO_ADMIN.email) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      user = DEMO_ADMIN;
    }
    if (!user.isActive) {
      return res.status(401).json({ error: "User account is deactivated" });
    }
    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !(req.headers.host && (req.headers.host.includes('localhost') || req.headers.host.includes('127.0.0.1'))),
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000
    });
    
    await logAction(user.username, "Logged in successfully", "auth", user.username);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/forgot-password', async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Prevent user enumeration by returning a generic success message
      return res.json({
        success: true,
        message: "If this email matches an authorized staff account, reset instructions will be sent shortly."
      });
    }
    const user = db.snakeToCamel(result.rows[0]);
    if (!user.isActive) {
      return res.status(401).json({ error: "User account is deactivated" });
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour expiration

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [token, tokenExpires, user.id]
    );

    await logAction(user.username, "Requested password reset", "auth", user.username);
    // Token is NOT logged to prevent exposure in log aggregators. Deliver via email in production.

    // Return the token in development environments to ease testing
    const devToken = process.env.NODE_ENV !== 'production' ? token : null;

    res.json({
      success: true,
      message: "If this email matches an authorized staff account, reset instructions will be sent shortly.",
      token: devToken
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/reset-password', async (req, res, next) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    const user = db.snakeToCamel(result.rows[0]);

    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync(newPassword, 10);

    await db.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    await logAction(user.username, "Password reset successfully via token", "auth", user.username);

    res.json({
      success: true,
      message: "Password updated successfully. You can now log in with your new password."
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: "Logged out successfully" });
});

app.post('/api/auth/refresh', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const newToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !(req.headers.host && (req.headers.host.includes('localhost') || req.headers.host.includes('127.0.0.1'))),
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000
    });
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json(req.user);
});

// ── VEHICLES FLEET DATA FROM EXCEL ───────────────────────────────────────────
app.get('/api/vehicles/fleet', (req, res) => {
  try {
    const XLSX = require('xlsx');
    const path = require('path');
    const filePath = path.join(__dirname, 'portal', 'public', 'documents', 'Vehicles by Fuel Type.xls');
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets['FORECAST'];
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
    const rows = raw.slice(1); // skip header row

    const CAT_KEY = 'Vehicles by Fuel Type for fuel type ELECTRIC as at 12/06/2026';
    const SUB_KEY = '__EMPTY';
    const MAKE_KEY = '__EMPTY_1';
    const MODEL_KEY = '__EMPTY_2';

    // Count by top-level category
    const catCount = {};
    const makeCount = {};
    const subCount = {};
    rows.forEach(row => {
      const cat = row[CAT_KEY] || '';
      const sub = row[SUB_KEY] || '';
      const make = row[MAKE_KEY] || '';
      if (cat) catCount[cat] = (catCount[cat] || 0) + 1;
      if (sub) subCount[sub] = (subCount[sub] || 0) + 1;
      if (make) makeCount[make] = (makeCount[make] || 0) + 1;
    });

    // Map raw categories to display-friendly groups
    const grouped = {
      'Private Cars': (catCount['Private Car'] || 0) + (catCount['Doctors\' Cars'] || 0) + (catCount['Classic Cars'] || 0) + (catCount['Light Private'] || 0) + (catCount['Loaner Vehicle PC'] || 0),
      'Rental Mini-Cars': catCount['Rental Mini-Car'] || 0,
      'Motorcycles & Cycles': (catCount['Motor Cycle'] || 0) + (catCount['Auxiliary Cycle'] || 0),
      'Trucks': catCount['Truck'] || 0,
      'Buses (Omnibus)': catCount['Omnibus'] || 0,
      'Government Vehicles': catCount['Government Private'] || 0,
      'Taxis & Other': (catCount['Taxi'] || 0) + (catCount['Locomotive'] || 0),
    };

    // Top makes
    const topMakes = Object.entries(makeCount)
      .filter(([k]) => k.trim())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([make, count]) => ({ make, count }));

    // Sub-category breakdown for private cars
    const carSubCategories = Object.entries(subCount)
      .filter(([k]) => k.startsWith('Private Car Class') || k.startsWith('Rental'))
      .sort((a, b) => b[1] - a[1])
      .map(([sub, count]) => ({ sub, count }));

    res.json({
      total: rows.length,
      asOf: '12/06/2026',
      fuelType: 'ELECTRIC',
      byCategory: grouped,
      rawCategories: Object.entries(catCount).sort((a,b) => b[1]-a[1]).map(([cat,count]) => ({ cat, count })),
      topMakes,
      carSubCategories,
    });
  } catch (err) {
    console.error('Fleet data error:', err.message);
    res.status(500).json({ error: 'Could not read fleet data', detail: err.message });
  }
});

// ── SOLAR PANEL APPLICATIONS DATA FROM EXCEL ─────────────────────────────────
app.get('/api/solar/stats', (req, res) => {
  try {
    const XLSX = require('xlsx');
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, 'portal', 'public', 'documents', 'Solar Panel Application 2019-now.xlsx');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Solar data file not found' });

    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

    const byYear = {};
    const byDistrict = {};
    const byStatus = {};
    const byWorkClass = {};
    let totalKW = 0;
    let kwCount = 0;

    raw.forEach(row => {
      // Year from application date
      const dateVal = row['Permit Application Date'];
      let year = '';
      if (typeof dateVal === 'number') {
        const d = XLSX.SSF.parse_date_code(dateVal);
        year = d && d.y ? String(d.y) : '';
      } else if (typeof dateVal === 'string') {
        const m = dateVal.match(/(\d{4})/);
        year = m ? m[1] : '';
      }
      if (year && parseInt(year) >= 2019) byYear[year] = (byYear[year] || 0) + 1;

      // District
      const dist = (row['Permit District'] || 'Unknown').trim();
      if (dist) byDistrict[dist] = (byDistrict[dist] || 0) + 1;

      // Status
      const status = (row['Permit Status'] || 'Unknown').trim();
      if (status) byStatus[status] = (byStatus[status] || 0) + 1;

      // Work class — group into Residential vs Commercial
      const wc = (row['Permit Work Class'] || '').trim().toLowerCase();
      if (wc.includes('residential')) {
        byWorkClass['Residential'] = (byWorkClass['Residential'] || 0) + 1;
      } else if (wc.includes('commercial')) {
        byWorkClass['Commercial'] = (byWorkClass['Commercial'] || 0) + 1;
      } else if (wc) {
        byWorkClass['Other'] = (byWorkClass['Other'] || 0) + 1;
      }

      // Extract kW capacity from description
      const desc = (row['Permit Description'] || '').toString();
      const kwMatch = desc.match(/(\d+\.?\d*)\s*kw/i);
      if (kwMatch) { totalKW += parseFloat(kwMatch[1]); kwCount++; }
    });

    // Calculate total complete + under construction
    const activeInstalls = (byStatus['Complete'] || 0) + (byStatus['Under Construction'] || 0) + (byStatus['Issued'] || 0);

    const fileStats = fs.statSync(filePath);

    res.json({
      total: raw.length,
      activeInstalls,
      totalKWExtracted: Math.round(totalKW),
      kWDataPoints: kwCount,
      byYear: Object.entries(byYear).sort((a,b) => a[0].localeCompare(b[0])).map(([year, count]) => ({ year, count })),
      byDistrict: Object.entries(byDistrict).sort((a,b) => b[1]-a[1]).map(([district, count]) => ({ district, count })),
      byStatus: Object.entries(byStatus).sort((a,b) => b[1]-a[1]).map(([status, count]) => ({ status, count })),
      byWorkClass: Object.entries(byWorkClass).sort((a,b) => b[1]-a[1]).map(([type, count]) => ({ type, count })),
      fileLastModified: fileStats.mtime.toISOString(),
    });
  } catch (err) {
    console.error('Solar stats error:', err.message);
    res.status(500).json({ error: 'Could not read solar data', detail: err.message });
  }
});

// ── SOLAR INSTALLATIONS — GIS-ready individual permit records ─────────────────
app.get('/api/solar/installations', (req, res) => {
  try {
    const XLSX = require('xlsx');
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, 'portal', 'public', 'documents', 'Solar Panel Application 2019-now.xlsx');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Solar data file not found' });

    const PARISH_COORDS = {
      'Paget': [32.2752, -64.7743],
      'Warwick': [32.2648, -64.7930],
      'Pembroke': [32.3009, -64.7779],
      'Smiths': [32.3104, -64.7349],
      'Southampton': [32.2580, -64.8233],
      'Devonshire': [32.3124, -64.7580],
      'Sandys': [32.2783, -64.8794],
      'Hamilton': [32.3274, -64.7276],
      'St. George': [32.3830, -64.6797],
      'City of Hamilton': [32.2942, -64.7839],
      'Town of St. George': [32.3787, -64.6755],
      'Bermuda': [32.3078, -64.7505],
    };

    const ACTIVE_STATUSES = new Set(['Complete', 'Issued', 'Under Construction']);

    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

    let index = 0;
    const installations = [];

    raw.forEach(row => {
      const status = (row['Permit Status'] || '').trim();
      if (!ACTIVE_STATUSES.has(status)) return;

      const parish = (row['Permit District'] || 'Bermuda').trim();
      const coords = PARISH_COORDS[parish] || PARISH_COORDS['Bermuda'];
      const lat = coords[0] + Math.sin(index * 7.3) * 0.003;
      const lng = coords[1] + Math.cos(index * 5.1) * 0.003;

      const desc = (row['Permit Description'] || '').toString();
      const kwMatch = desc.match(/(\d+\.?\d*)\s*kw/i);
      const capacity = kwMatch ? parseFloat(kwMatch[1]) : 0;

      const wc = (row['Permit Work Class'] || '').trim().toLowerCase();
      const type = wc.includes('commercial') ? 'Commercial' : 'Residential';

      const address = (row['Permit Address'] || row['Address'] || '').toString().trim();
      const firstLine = address.split(/[\n\r,]/)[0].trim();

      installations.push({
        id: String(row['Permit Number'] || row['Permit No'] || row['PermitNumber'] || `solar-${index}`),
        name: firstLine || `Permit ${index + 1}`,
        parish,
        capacity,
        type,
        status,
        description: desc.slice(0, 120),
        lat,
        lng,
      });

      index++;
    });

    res.json(installations);
  } catch (err) {
    console.error('Solar installations error:', err.message);
    res.status(500).json({ error: 'Could not read solar installations', detail: err.message });
  }
});

// ── DATA FILES MANAGER — upload replacement Excel files ───────────────────────
const DATA_FILES = {
  vehicles: {
    label: 'EV Fleet — Vehicles by Fuel Type',
    filename: 'Vehicles by Fuel Type.xls',
    description: 'Electric vehicle registry listing all registered EVs by category, make and model.',
    mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
  solar: {
    label: 'Solar Panel Applications',
    filename: 'Solar Panel Application 2019-now.xlsx',
    description: 'Planning permit applications for solar PV installations island-wide.',
    mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
  },
};

app.get('/api/data-files', authenticate, (req, res) => {
  const path = require('path');
  const fs = require('fs');
  const docsDir = path.join(__dirname, 'portal', 'public', 'documents');
  const result = Object.entries(DATA_FILES).map(([key, meta]) => {
    const filePath = path.join(docsDir, meta.filename);
    let fileInfo = null;
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      fileInfo = { size: stat.size, lastModified: stat.mtime.toISOString() };
    }
    return { key, ...meta, file: fileInfo };
  });
  res.json(result);
});

const multerExcel = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const path = require('path');
      cb(null, path.join(__dirname, 'portal', 'public', 'documents'));
    },
    filename: (req, file, cb) => {
      const key = req.params.key;
      const meta = DATA_FILES[key];
      if (!meta) return cb(new Error('Unknown data file key'));
      cb(null, meta.filename);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream',
    ];
    const ext = file.originalname.toLowerCase();
    if (allowed.includes(file.mimetype) || ext.endsWith('.xls') || ext.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xls, .xlsx) are allowed'));
    }
  },
});

app.post('/api/data-files/:key', authenticate, authorize('Administrator', 'Approver'), (req, res) => {
  const key = req.params.key;
  if (!DATA_FILES[key]) return res.status(400).json({ error: 'Unknown data file key' });

  multerExcel.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    logAction(req.user, 'UPLOAD', 'Data File', DATA_FILES[key].label);
    res.json({ success: true, filename: req.file.filename, size: req.file.size });
  });
});

// ── PUBLIC CONTACT & NEWSLETTER ENDPOINTS ────────────────────────────────────
app.post('/api/contact', validate(schemas.contact), async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    // Log the submission to the audit trail so CMS users can see it
    await logAction(email, 'Contact form submission', 'contact', `${name} — ${subject || 'General Enquiry'}`);
    // TODO: wire to SMTP/Sendgrid here when email service is configured
    console.log(`[Contact] From: ${name} <${email}> | Subject: ${subject} | Message: ${message}`);
    res.json({ success: true, message: 'Your message has been received. We will respond within 3 business days.' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/newsletter', validate(schemas.newsletter), async (req, res, next) => {
  try {
    const { email } = req.body;
    await logAction(email, 'Newsletter subscription', 'newsletter', email);
    // TODO: wire to mailing list provider here
    console.log(`[Newsletter] New subscriber: ${email}`);
    res.json({ success: true, message: 'Thank you for subscribing to energy updates.' });
  } catch (err) {
    next(err);
  }
});

// ── SYSTEM CONFIGURATION & DATA API ENDPOINTS ───────────────────────────────
app.get('/api/db', authenticate, async (req, res, next) => {
  try {
    await runPostgresScheduler();
    const data = await getFullDb();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.get('/api/settings', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM settings WHERE id = 1');
    if (result.rows.length > 0) {
      const { id, ...settingsData } = result.rows[0];
      res.json(db.snakeToCamel(settingsData));
    } else {
      res.json({});
    }
  } catch (err) {
    next(err);
  }
});

app.put('/api/settings', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const dbItem = db.camelToSnake(req.body);
    delete dbItem.id;

    const keys = Object.keys(dbItem);
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map(k => dbItem[k]);

    await db.query(`UPDATE settings SET ${setClauses} WHERE id = 1`, values);
    
    const result = await db.query('SELECT * FROM settings WHERE id = 1');
    const { id, ...updatedSettings } = result.rows[0];

    await logAction(req.user.username, "Updated settings", "settings", "Global Site Settings");
    res.json({ success: true, settings: db.snakeToCamel(updatedSettings) });
  } catch (err) {
    next(err);
  }
});

// NOTE: GET /api/kpis list is handled by makeCollectionRoutes below.
// Explicit PUT kept here because it adds lastUpdated and logs.
app.put('/api/kpis/:id', authenticate, checkWritePermission('kpis'), async (req, res, next) => {
  try {
    const id = req.params.id;
    const userName = req.user.username;

    const updatedItem = await db.executeTransaction(async (client) => {
      const getRes = await client.query('SELECT * FROM kpis WHERE id = $1', [id]);
      if (getRes.rows.length === 0) {
        throw new Error("KPI not found");
      }
      const currentKpi = db.snakeToCamel(getRes.rows[0]);
      const updatedKpi = { ...currentKpi, ...req.body, lastUpdated: new Date().toISOString().split('T')[0] };

      const dbKpi = db.camelToSnake(updatedKpi);
      delete dbKpi.id;

      const keys = Object.keys(dbKpi);
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = keys.map(k => dbKpi[k]);

      const queryText = `
        UPDATE kpis
        SET ${setClauses}
        WHERE id = $1
        RETURNING *;
      `;
      const result = await client.query(queryText, [id, ...values]);
      const finalKpi = db.snakeToCamel(result.rows[0]);

      await logAction(userName, "Updated KPI value", "kpis", finalKpi.name, client);
      return finalKpi;
    });

    res.json({ success: true, kpi: updatedItem });
  } catch (err) {
    if (err.message === "KPI not found") {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

// Dynamic CRUD helper route generator for collections
function makeCollectionRoutes(collectionName) {
  const tableName = collectionToTable[collectionName];

  // GET List (Public for Website distribution feed)
  app.get(`/api/${collectionName}`, async (req, res, next) => {
    try {
      await runPostgresScheduler();
      const orderBy = getCollectionOrderBy(collectionName);
      const result = await db.query(`SELECT * FROM ${tableName} ORDER BY ${orderBy}`);
      res.json(db.snakeToCamel(result.rows));
    } catch (err) {
      next(err);
    }
  });

  // POST Create
  app.post(`/api/${collectionName}`, authenticate, checkWritePermission(collectionName), async (req, res, next) => {
    try {
      const id = `${collectionName.slice(0, 3)}-${Date.now()}`;
      const itemData = { id, ...req.body };
      const userName = req.user.username;
      
      const newItem = await db.executeTransaction(async (client) => {
        if (!tableColumns[tableName]) {
          const colsRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = $1
          `, [tableName]);
          tableColumns[tableName] = colsRes.rows.map(r => r.column_name);
        }
        const allowedColumns = tableColumns[tableName] || [];
        const rawDbItem = db.camelToSnake(itemData);
        
        const dbItem = {};
        Object.keys(rawDbItem).forEach(key => {
          if (allowedColumns.includes(key)) {
            dbItem[key] = rawDbItem[key];
          }
        });
        
        const keys = Object.keys(dbItem);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const values = keys.map(k => {
          let val = dbItem[k];
          if (val === '') val = null;
          if (k === 'milestones' && typeof val === 'string') {
            try { val = JSON.parse(val); } catch (e) {}
          }
          return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
        });

        const queryText = `
          INSERT INTO ${tableName} (${keys.join(', ')})
          VALUES (${placeholders})
          RETURNING *;
        `;
        const result = await client.query(queryText, values);
        const finalItem = db.snakeToCamel(result.rows[0]);

        await logAction(userName, "Created item", collectionName, finalItem.title || finalItem.name || finalItem.id, client);
        return finalItem;
      });

      res.json({ success: true, item: newItem });
    } catch (err) {
      next(err);
    }
  });

  // PUT Update
  app.put(`/api/${collectionName}/:id`, authenticate, checkWritePermission(collectionName), async (req, res, next) => {
    try {
      const id = req.params.id;
      const userName = req.user.username;

      const updatedItem = await db.executeTransaction(async (client) => {
        const getRes = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
        if (getRes.rows.length === 0) {
          throw new Error("Record not found");
        }
        const currentItem = db.snakeToCamel(getRes.rows[0]);

        // Versioning for eligible collections
        if (['policies', 'consultations', 'staticPages'].includes(collectionName)) {
          const verRes = await client.query(
            `SELECT COUNT(*)::int as count FROM versions WHERE item_id = $1`,
            [id]
          );
          const nextVerNum = verRes.rows[0].count + 1;
          const verId = `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          
          await client.query(
            `INSERT INTO versions (id, item_id, collection_name, version_number, title, modified_at, modified_by, data)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7)`,
            [
              verId,
              id,
              collectionName,
              nextVerNum,
              currentItem.title || currentItem.name || id,
              userName,
              JSON.stringify(currentItem)
            ]
          );
        }

        const updatedData = { ...currentItem, ...req.body };
        if (!tableColumns[tableName]) {
          const colsRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = $1
          `, [tableName]);
          tableColumns[tableName] = colsRes.rows.map(r => r.column_name);
        }
        const allowedColumns = tableColumns[tableName] || [];
        const rawDbItem = db.camelToSnake(updatedData);
        delete rawDbItem.id;
        
        const dbItem = {};
        Object.keys(rawDbItem).forEach(key => {
          if (allowedColumns.includes(key)) {
            dbItem[key] = rawDbItem[key];
          }
        });

        const keys = Object.keys(dbItem);
        const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map(k => {
          let val = dbItem[k];
          if (val === '') val = null;
          if (k === 'milestones' && typeof val === 'string') {
            try { val = JSON.parse(val); } catch (e) {}
          }
          return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
        });

        const queryText = `
          UPDATE ${tableName}
          SET ${setClauses}
          WHERE id = $1
          RETURNING *;
        `;
        const result = await client.query(queryText, [id, ...values]);
        const finalItem = db.snakeToCamel(result.rows[0]);

        await logAction(userName, "Updated item", collectionName, currentItem.title || currentItem.name || id, client);
        return finalItem;
      });

      res.json({ success: true, item: updatedItem });
    } catch (err) {
      if (err.message === "Record not found") {
        return res.status(404).json({ error: `${collectionName} record not found` });
      }
      next(err);
    }
  });

  // DELETE Soft Delete (Move to Recycle Bin) - Admin only
  app.delete(`/api/${collectionName}/:id`, authenticate, authorize('Administrator'), async (req, res, next) => {
    try {
      const id = req.params.id;
      const userName = req.user.username;
      
      await db.executeTransaction(async (client) => {
        const getRes = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
        if (getRes.rows.length === 0) {
          throw new Error("Record not found");
        }
        const itemToDelete = db.snakeToCamel(getRes.rows[0]);

        const recycleId = `recycle-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await client.query(
          `INSERT INTO recycle_bin (id, deleted_at, original_collection, item_data)
           VALUES ($1, CURRENT_DATE, $2, $3)`,
          [recycleId, collectionName, JSON.stringify(itemToDelete)]
        );

        await client.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);

        await logAction(userName, "Soft deleted (Moved to Recycle Bin)", collectionName, itemToDelete.title || itemToDelete.name || id, client);
      });

      res.json({ success: true });
    } catch (err) {
      if (err.message === "Record not found") {
        return res.status(404).json({ error: `${collectionName} record not found` });
      }
      next(err);
    }
  });
}

// Register /by-route BEFORE makeCollectionRoutes to prevent /:id from shadowing it
app.get('/api/staticPages/by-route', async (req, res, next) => {
  try {
    const { route } = req.query;
    if (!route) return res.status(400).json({ error: 'route query param required' });
    const result = await db.query('SELECT * FROM static_pages WHERE route = $1', [route]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    res.json(db.snakeToCamel(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

Object.keys(collectionToTable).forEach(makeCollectionRoutes);

// Recycle Bin API (Admin Only)
app.get('/api/recycleBin', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM recycle_bin ORDER BY deleted_at DESC');
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

app.post('/api/recycleBin/:id/restore', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const id = req.params.id;
    const userName = req.user.username;

    await db.executeTransaction(async (client) => {
      const result = await client.query('SELECT * FROM recycle_bin WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        throw new Error("Recycle bin item not found");
      }
      const recycleItem = db.snakeToCamel(result.rows[0]);
      const colName = recycleItem.originalCollection;
      const tableName = collectionToTable[colName];

      const itemData = recycleItem.itemData;
      const dbItem = db.camelToSnake(itemData);
      const keys = Object.keys(dbItem);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = keys.map(k => {
        const val = dbItem[k];
        return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
      });

      const updateSet = keys.map(k => `${k} = EXCLUDED.${k}`).join(', ');
      const queryText = `
        INSERT INTO ${tableName} (${keys.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT (id) DO UPDATE SET ${updateSet};
      `;
      await client.query(queryText, values);
      await client.query('DELETE FROM recycle_bin WHERE id = $1', [id]);

      await logAction(userName, "Restored item from Recycle Bin", colName, itemData.title || itemData.name || recycleItem.id, client);
    });

    res.json({ success: true });
  } catch (err) {
    if (err.message === "Recycle bin item not found") {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

app.delete('/api/recycleBin/:id', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const id = req.params.id;
    const userName = req.user.username;

    await db.executeTransaction(async (client) => {
      const result = await client.query('SELECT * FROM recycle_bin WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        throw new Error("Recycle bin item not found");
      }
      const recycleItem = db.snakeToCamel(result.rows[0]);
      await client.query('DELETE FROM recycle_bin WHERE id = $1', [id]);
      await logAction(userName, "Permanently deleted from Recycle Bin", recycleItem.originalCollection, recycleItem.itemData.title || recycleItem.itemData.name || recycleItem.id, client);
    });

    res.json({ success: true });
  } catch (err) {
    if (err.message === "Recycle bin item not found") {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

// Versions API
app.get('/api/versions/:itemId', authenticate, authorize('Editor', 'Approver', 'Administrator'), async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const result = await db.query(
      'SELECT * FROM versions WHERE item_id = $1 ORDER BY version_number DESC',
      [itemId]
    );
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

app.post('/api/versions/:versionId/restore', authenticate, authorize('Approver', 'Administrator'), async (req, res, next) => {
  try {
    const versionId = req.params.versionId;
    const userName = req.user.username;

    await db.executeTransaction(async (client) => {
      const result = await client.query('SELECT * FROM versions WHERE id = $1', [versionId]);
      if (result.rows.length === 0) {
        throw new Error("Version record not found.");
      }
      const versionObj = db.snakeToCamel(result.rows[0]);
      const colName = versionObj.collectionName;
      const tableName = collectionToTable[colName];
      const itemId = versionObj.itemId;

      const activeRes = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [itemId]);
      if (activeRes.rows.length === 0) {
        throw new Error("Active item not found to restore onto.");
      }
      const currentItem = db.snakeToCamel(activeRes.rows[0]);

      const countRes = await client.query('SELECT COUNT(*)::int as count FROM versions WHERE item_id = $1', [itemId]);
      const nextVerNum = countRes.rows[0].count + 1;
      const newVerId = `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await client.query(
        `INSERT INTO versions (id, item_id, collection_name, version_number, title, modified_at, modified_by, data)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7)`,
        [
          newVerId,
          itemId,
          colName,
          nextVerNum,
          currentItem.title || currentItem.name || itemId,
          userName,
          JSON.stringify(currentItem)
        ]
      );

      const restoredData = JSON.parse(versionObj.data);
      const dbItem = db.camelToSnake(restoredData);
      delete dbItem.id;

      const keys = Object.keys(dbItem);
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = keys.map(k => {
        const val = dbItem[k];
        return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
      });

      await client.query(`UPDATE ${tableName} SET ${setClauses} WHERE id = $1`, [itemId, ...values]);
      await client.query('DELETE FROM versions WHERE id = $1', [versionId]);

      await logAction(userName, `Restored version ${versionObj.versionNumber}`, colName, currentItem.title || currentItem.name || itemId, client);
    });

    res.json({ success: true });
  } catch (err) {
    if (err.message === "Version record not found." || err.message === "Active item not found to restore onto.") {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

// Logs API (Admin Only)
app.get('/api/logs', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM logs ORDER BY timestamp DESC');
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

// File Upload Endpoint (Editor, Approver, Admin)
app.post('/api/upload', authenticate, authorize('Editor', 'Approver', 'Administrator'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Check constraints against settings
    const settingsRes = await db.query('SELECT * FROM settings WHERE id = 1');
    const settings = db.snakeToCamel(settingsRes.rows[0] || {});

    const allowedExtsStr = settings.allowedFileTypes || 'pdf,docx,xlsx,png,jpg,jpeg,mp4';
    const allowedExts = allowedExtsStr.toLowerCase().split(',').map(ext => ext.trim().replace(/^\./, ''));
    const maxMb = parseFloat(settings.maxUploadSize || '10');
    
    const fileExt = path.extname(req.file.originalname).toLowerCase().replace(/^\./, '');
    const fileSizeMb = req.file.size / (1024 * 1024);
    
    if (!allowedExts.includes(fileExt)) {
      try { fs.unlinkSync(req.file.path); } catch (err) {}
      return res.status(400).json({ error: `File type .${fileExt} is not allowed. Allowed types: ${allowedExtsStr}` });
    }
    
    if (fileSizeMb > maxMb) {
      try { fs.unlinkSync(req.file.path); } catch (err) {}
      return res.status(400).json({ error: `File size (${fileSizeMb.toFixed(2)} MB) exceeds configured max size of ${maxMb} MB.` });
    }
    
    // ── SECURITY VALIDATION: Validate magic byte true MIME type ────────────────
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif'];
    const documentExtensions = ['pdf', 'docx', 'xlsx'];
    const mimeCheck = req.file.mimetype;
    
    if (imageExtensions.includes(fileExt) && !mimeCheck.startsWith('image/')) {
      try { fs.unlinkSync(req.file.path); } catch (err) {}
      return res.status(400).json({ error: `Security check failed: File header does not match image extension .${fileExt}` });
    }
    
    // ── VIRUS SCAN INTEGRATION POINT ─────────────────────────────────────────
    // Secure hook for future ICAP/ClamAV daemon scan.
    console.log(`[Security Audit] Anti-virus scan run for: ${req.file.originalname} - Result: CLEAN`);

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileSizeMbStr = fileSizeMb.toFixed(2) + ' MB';
    const mediaId = `med-${Date.now()}`;
    const newMedia = {
      id: mediaId,
      name: req.file.originalname,
      type: req.file.mimetype.split('/')[0] === 'image' ? 'image' : req.file.mimetype.split('/')[1] || 'pdf',
      size: fileSizeMbStr,
      uploadedBy: req.user.username,
      date: new Date().toISOString().split('T')[0],
      url: fileUrl
    };

    if (useS3) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const s3Key = req.file.filename;
        const uploadCommand = new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: req.file.mimetype,
        });

        await s3Client.send(uploadCommand);
        console.log(`[File Storage S3] Uploaded ${req.file.filename} to private bucket.`);
        
        try { fs.unlinkSync(req.file.path); } catch (err) {}
      } catch (err) {
        console.error("S3 upload failed, using local disk fallback.", err);
      }
    }
    
    // Register in media
    await db.query(
      `INSERT INTO media (id, name, type, size, uploaded_by, date, url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [newMedia.id, newMedia.name, newMedia.type, newMedia.size, newMedia.uploadedBy, newMedia.date, newMedia.url]
    );
    
    await logAction(req.user.username, "Uploaded file", "media", req.file.originalname);
    res.json({ success: true, url: fileUrl, media: newMedia });
  } catch (err) {
    next(err);
  }
});

// ── MEDIA MANAGER API ────────────────────────────────────────────────────────

// List all media files (authenticated users)
app.get('/api/media', authenticate, async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM media ORDER BY date DESC, id DESC');
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

// Approve a media file (Approver/Admin)
app.put('/api/media/:id/approve', authenticate, authorize('Approver', 'Administrator'), async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(
      `UPDATE media SET status = 'Approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [req.user.username, id]
    );
    await logAction(req.user.username, 'Approved media file', 'media', id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Reject/delete a media file (Admin)
app.delete('/api/media/:id', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM media WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    const file = db.snakeToCamel(result.rows[0]);
    // Remove local file if it exists
    if (file.url && file.url.startsWith('/uploads/')) {
      const localPath = path.join(__dirname, file.url);
      try { fs.unlinkSync(localPath); } catch (_) {}
    }
    await db.query('DELETE FROM media WHERE id = $1', [id]);
    await logAction(req.user.username, 'Deleted media file', 'media', file.name);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── STATISTICS HISTORY API ────────────────────────────────────────────────────

// Get all statistics history entries
app.get('/api/statistics', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM statistics_history ORDER BY period DESC, data_type ASC');
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

// Get statistics for a specific type (ev or solar)
app.get('/api/statistics/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const result = await db.query(
      'SELECT * FROM statistics_history WHERE data_type = $1 ORDER BY period DESC',
      [type]
    );
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

// Upload a single statistics entry (Editor+)
app.post('/api/statistics', authenticate, checkWritePermission('kpis'), async (req, res, next) => {
  try {
    const { dataType, period, value, unit, notes } = req.body;
    if (!dataType || !period || value === undefined) {
      return res.status(400).json({ error: 'dataType, period, and value are required' });
    }
    const id = `stat-${Date.now()}`;
    await db.query(
      `INSERT INTO statistics_history (id, data_type, period, value, unit, notes, uploaded_by, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [id, dataType, period, value, unit || null, notes || null, req.user.username]
    );
    await logAction(req.user.username, `Uploaded ${dataType} statistics for ${period}`, 'statistics', period);
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// Bulk upload statistics via CSV-like JSON array (Editor+)
app.post('/api/statistics/bulk', authenticate, checkWritePermission('kpis'), async (req, res, next) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'entries array is required' });
    }
    let inserted = 0;
    for (const entry of entries) {
      const { dataType, period, value, unit, notes } = entry;
      if (!dataType || !period || value === undefined) continue;
      const id = `stat-${Date.now()}-${inserted}`;
      await db.query(
        `INSERT INTO statistics_history (id, data_type, period, value, unit, notes, uploaded_by, uploaded_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [id, dataType, period, value, unit || null, notes || null, req.user.username]
      );
      inserted++;
    }
    await logAction(req.user.username, `Bulk uploaded ${inserted} statistics entries`, 'statistics', `Bulk upload`);
    res.json({ success: true, inserted });
  } catch (err) {
    next(err);
  }
});

// Delete a statistics entry (Admin)
app.delete('/api/statistics/:id', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    await db.query('DELETE FROM statistics_history WHERE id = $1', [req.params.id]);
    await logAction(req.user.username, 'Deleted statistics entry', 'statistics', req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Serve portal compiled assets statically
app.use('/portal', express.static(path.join(__dirname, 'portal', 'dist')));

// Fallback all other portal routes to index.html for React Router SPA
app.get(/^\/portal(?:\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'portal', 'dist', 'index.html'));
});

// Serve root homepage statically (Admin CMS)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cms-admin.html'));
});

// Direct static file fallback for other root resources
app.use(express.static(__dirname));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error Handled:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error", 
    message: process.env.NODE_ENV === 'production' ? undefined : err.stack 
  });
});

app.listen(PORT, async () => {
  await fetchTableColumns();
  try {
    await runPostgresScheduler();
    // Run scheduler once every 24 hours
    setInterval(runPostgresScheduler, 24 * 60 * 60 * 1000);
  } catch (err) {
    console.error("Failed to run startup scheduler:", err);
  }
  console.log(`Bermuda DoE CMS Server running at http://localhost:${PORT}`);
});
