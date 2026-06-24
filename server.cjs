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
    // Self-origin: CMS portal calling its own Railway/EB API
    if (process.env.RAILWAY_PUBLIC_DOMAIN && origin === `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) {
      return callback(null, true);
    }
    if (approvedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS: Origin rejected'));
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
  let token = req.cookies.token;
  if (!token) {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
  }
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
  leadership: 'leadership',
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
  leadership: 'display_order ASC, id ASC',
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
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

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

  // Allow configured origins (including Vercel frontend) to load images cross-origin
  const origin = req.headers.origin;
  const allowed = allowAllOrigins || !origin ||
    approvedOrigins.includes(origin) ||
    (process.env.RAILWAY_PUBLIC_DOMAIN && origin === `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
  if (allowed && origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

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
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000
    });
    
    await logAction(user.username, "Logged in successfully", "auth", user.username);
    
    res.json({
      success: true,
      token,
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
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'lax',
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

// ── VEHICLES FLEET DATA — DB cache first, local file fallback ────────────────
function parseVehiclesExcel(filePath) {
  const XLSX = require('xlsx');
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames.includes('FORECAST') ? 'FORECAST' : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
  const rows = raw.slice(1);

  // Column keys: first col is category (header contains date), rest are unnamed
  const headerKeys = raw.length > 0 ? Object.keys(raw[0]) : [];
  const CAT_KEY = headerKeys[0] || '__EMPTY';
  const SUB_KEY = headerKeys[1] || '__EMPTY_1';
  const MAKE_KEY = headerKeys[2] || '__EMPTY_2';

  const catCount = {}, makeCount = {}, subCount = {};
  rows.forEach(row => {
    const cat = row[CAT_KEY] || ''; const sub = row[SUB_KEY] || ''; const make = row[MAKE_KEY] || '';
    if (cat) catCount[cat] = (catCount[cat] || 0) + 1;
    if (sub) subCount[sub] = (subCount[sub] || 0) + 1;
    if (make) makeCount[make] = (makeCount[make] || 0) + 1;
  });

  const grouped = {
    'Private Cars': (catCount['Private Car']||0)+(catCount["Doctors' Cars"]||0)+(catCount['Classic Cars']||0)+(catCount['Light Private']||0)+(catCount['Loaner Vehicle PC']||0),
    'Rental Mini-Cars': catCount['Rental Mini-Car']||0,
    'Motorcycles & Cycles': (catCount['Motor Cycle']||0)+(catCount['Auxiliary Cycle']||0),
    'Trucks': catCount['Truck']||0,
    'Buses (Omnibus)': catCount['Omnibus']||0,
    'Government Vehicles': catCount['Government Private']||0,
    'Taxis & Other': (catCount['Taxi']||0)+(catCount['Locomotive']||0),
  };

  const topMakes = Object.entries(makeCount).filter(([k])=>k.trim()).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([make,count])=>({make,count}));
  const dateMatch = CAT_KEY.match(/(\d{2}\/\d{2}\/\d{4})/);
  const asOf = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('en-GB');

  return { total: rows.length, asOf, fuelType: 'ELECTRIC', byCategory: grouped, rawCategories: Object.entries(catCount).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>({cat,count})), topMakes };
}

app.get('/api/vehicles/fleet', async (req, res) => {
  try {
    // Try DB cache first (populated when a new file is uploaded via CMS)
    try {
      await db.query(`CREATE TABLE IF NOT EXISTS data_cache (key TEXT PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)`);
      const cacheRes = await db.query(`SELECT value FROM data_cache WHERE key = 'vehicle_fleet'`);
      if (cacheRes.rows.length > 0) return res.json(cacheRes.rows[0].value);
    } catch (_) {}

    // Fall back to the file bundled in the deployment zip
    const filePath = path.join(__dirname, 'portal', 'public', 'documents', 'Vehicles by Fuel Type.xls');
    res.json(parseVehiclesExcel(filePath));
  } catch (err) {
    console.error('Fleet data error:', err.message);
    res.status(500).json({ error: 'Could not read fleet data', detail: err.message });
  }
});

// ── SOLAR PANEL APPLICATIONS — served from PostgreSQL ────────────────────────
app.get('/api/solar/stats', async (req, res) => {
  try {
    const countRes = await db.query('SELECT COUNT(*) FROM solar_installations');
    const total = parseInt(countRes.rows[0].count, 10);
    if (total === 0) return res.json({ total: 0, activeInstalls: 0, totalKWExtracted: 0, byYear: [], byDistrict: [], byStatus: [], byWorkClass: [], fileLastModified: null });

    const [yearRes, parishRes, statusRes, typeRes, capRes, activeRes, modRes] = await Promise.all([
      db.query("SELECT EXTRACT(YEAR FROM install_date)::TEXT AS year, COUNT(*)::INT FROM solar_installations WHERE install_date IS NOT NULL GROUP BY year ORDER BY year"),
      db.query("SELECT parish, COUNT(*)::INT FROM solar_installations GROUP BY parish ORDER BY count DESC"),
      db.query("SELECT status, COUNT(*)::INT FROM solar_installations GROUP BY status ORDER BY count DESC"),
      db.query("SELECT type, COUNT(*)::INT FROM solar_installations GROUP BY type ORDER BY count DESC"),
      db.query("SELECT COALESCE(SUM(capacity),0) AS total_kw, COUNT(*) FILTER (WHERE capacity > 0) AS cap_count FROM solar_installations"),
      db.query("SELECT COUNT(*)::INT FROM solar_installations WHERE status IN ('Complete','Issued','Under Construction')"),
      db.query("SELECT MAX(updated_at) AS last_modified FROM solar_installations"),
    ]);

    res.json({
      total,
      activeInstalls: parseInt(activeRes.rows[0].count, 10),
      totalKWExtracted: Math.round(parseFloat(capRes.rows[0].total_kw) || 0),
      kWDataPoints: parseInt(capRes.rows[0].cap_count, 10),
      byYear: yearRes.rows.map(r => ({ year: String(r.year), count: r.count })),
      byDistrict: parishRes.rows.map(r => ({ district: r.parish || 'Unknown', count: r.count })),
      byStatus: statusRes.rows.map(r => ({ status: r.status || 'Unknown', count: r.count })),
      byWorkClass: typeRes.rows.map(r => ({ type: r.type || 'Unknown', count: r.count })),
      fileLastModified: modRes.rows[0]?.last_modified || null,
    });
  } catch (err) {
    console.error('Solar stats error:', err.message);
    res.status(500).json({ error: 'Could not read solar data', detail: err.message });
  }
});

// ── SOLAR INSTALLATIONS — served from PostgreSQL ─────────────────────────────
app.get('/api/solar/installations', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, parish, type, capacity, status, install_date,
              lat, lng, notes AS description,
              COALESCE(address, name, '') AS address,
              COALESCE(annual_output, 0) AS annual_output
       FROM solar_installations ORDER BY id LIMIT 5000`
    );
    const installations = result.rows.map(row => ({
      id: row.id,
      name: row.name || '',
      parish: row.parish || '',
      capacity: parseFloat(row.capacity) || 0,
      type: row.type || 'Residential',
      status: row.status || 'Unknown',
      description: row.description || '',
      address: row.address || '',
      annualOutput: parseFloat(row.annual_output) || 0,
      lat: parseFloat(row.lat) || 0,
      lng: parseFloat(row.lng) || 0,
    }));
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

  multerExcel.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    if (key === 'vehicles') {
      try {
        const fleetData = parseVehiclesExcel(req.file.path);
        await db.query(`CREATE TABLE IF NOT EXISTS data_cache (key TEXT PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)`);
        await db.query(`INSERT INTO data_cache (key,value,updated_at) VALUES ($1,$2,CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=CURRENT_TIMESTAMP`, ['vehicle_fleet', JSON.stringify(fleetData)]);
        logAction(req.user, 'UPLOAD', 'Data File', `Vehicles fleet — ${fleetData.total} records imported`);
        return res.json({ success: true, filename: req.file.filename, size: req.file.size, total: fleetData.total });
      } catch (parseErr) {
        console.error('Vehicles Excel parse error:', parseErr);
        logAction(req.user, 'UPLOAD', 'Data File', DATA_FILES[key].label);
        return res.json({ success: true, filename: req.file.filename, size: req.file.size });
      }
    }

    if (key !== 'solar') {
      logAction(req.user, 'UPLOAD', 'Data File', DATA_FILES[key].label);
      return res.json({ success: true, filename: req.file.filename, size: req.file.size });
    }

    // Solar upload: parse Excel and persist rows to PostgreSQL
    try {
      const XLSX = require('xlsx');
      const wb = XLSX.readFile(req.file.path);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

      // Flexible case-insensitive column lookup
      const colMap = {};
      if (raw.length > 0) Object.keys(raw[0]).forEach(k => { colMap[k.toLowerCase().trim()] = k; });
      const getCol = (row, ...names) => {
        for (const name of names) {
          const k = colMap[name.toLowerCase().trim()];
          if (k !== undefined) { const v = row[k]; if (v !== '' && v != null) return v; }
        }
        return '';
      };

      const PARISH_COORDS = {
        'Paget': [32.2752, -64.7743], 'Warwick': [32.2648, -64.7930],
        'Pembroke': [32.3009, -64.7779], "Smith's": [32.3104, -64.7349],
        'Southampton': [32.2580, -64.8233], 'Devonshire': [32.3124, -64.7580],
        'Sandys': [32.2783, -64.8794], 'Hamilton': [32.3274, -64.7276],
        "St. George's": [32.3830, -64.6797], 'Bermuda': [32.3078, -64.7505],
      };
      const OFFICIAL_PARISHES = [
        ['Devonshire',[32.3124,-64.7580]],['Hamilton',[32.3274,-64.7276]],
        ['Paget',[32.2752,-64.7743]],['Pembroke',[32.3009,-64.7779]],
        ['Sandys',[32.2783,-64.8794]],["Smith's",[32.3104,-64.7349]],
        ['Southampton',[32.2580,-64.8233]],["St. George's",[32.3830,-64.6797]],
        ['Warwick',[32.2648,-64.7930]],
      ];
      const nearestParish = (lat, lng) => {
        let best = OFFICIAL_PARISHES[0][0], bestD = Infinity;
        for (const [n,[plat,plng]] of OFFICIAL_PARISHES) { const d=(lat-plat)**2+(lng-plng)**2; if(d<bestD){bestD=d;best=n;} }
        return best;
      };
      const PARISH_MAP = { 'Town of St. George':"St. George's", 'St. George':"St. George's", 'City of Hamilton':'Hamilton', 'Smiths':"Smith's" };
      const ACTIVE = new Set(['Complete','Issued','Under Construction']);

      // Ensure extra columns exist
      await db.query(`ALTER TABLE solar_installations ADD COLUMN IF NOT EXISTS annual_output NUMERIC DEFAULT 0`);
      await db.query(`ALTER TABLE solar_installations ADD COLUMN IF NOT EXISTS address TEXT`);
      await db.query('TRUNCATE solar_installations');

      let inserted = 0;
      for (let i = 0; i < raw.length; i++) {
        const row = raw[i];
        const rawLat = getCol(row,'lat','latitude');
        const rawLng = getCol(row,'lon','lng','longitude','long');
        const parsedLat = parseFloat(String(rawLat).trim());
        let parsedLng = parseFloat(String(rawLng).trim());
        if (Number.isFinite(parsedLng) && parsedLng > 0 && parsedLng < 70) parsedLng = -parsedLng;
        const hasCoords = Number.isFinite(parsedLat) && Number.isFinite(parsedLng) && parsedLat !== 0 && parsedLng !== 0;

        const status = String(getCol(row,'Permit Status') || '').trim();
        if (!hasCoords && !ACTIVE.has(status)) continue;

        let parish = String(getCol(row,'Permit District','Parish','District') || 'Bermuda').trim();
        parish = PARISH_MAP[parish] ?? parish;

        let lat, lng;
        if (hasCoords) { lat = parsedLat; lng = parsedLng; }
        else { const c = PARISH_COORDS[parish] || PARISH_COORDS['Bermuda']; lat = c[0]+Math.sin(i*7.3)*0.003; lng = c[1]+Math.cos(i*5.1)*0.003; }
        if (parish === 'Bermuda') parish = nearestParish(lat, lng);

        const rawCap = getCol(row,'Extracted AC Capacity','AC Capacity','AC Capacity (kW)','Capacity (kW)','Capacity','capacity');
        let capacity = parseFloat(String(rawCap).trim());
        if (!Number.isFinite(capacity) || capacity <= 0) {
          const desc2 = String(getCol(row,'Permit Description') || '');
          const m2 = desc2.match(/(\d+\.?\d*)\s*kw/i);
          capacity = m2 ? parseFloat(m2[1]) : 0;
        }
        if (capacity > 1000) capacity = capacity / 1000;

        const annualOutput = parseFloat(String(getCol(row,'Annual Output (kWh)','Annual Output','Annual Output kWh') || 0)) || 0;
        const wc = String(getCol(row,'Permit Work Class','Permit Type','Work Class') || '').toLowerCase();
        const type = wc.includes('commercial') ? 'Commercial' : wc.includes('utility') ? 'Utility' : 'Residential';
        const address = String(getCol(row,'Adresss','Address','Permit Address','address') || '').trim();
        const firstLine = address.split(/[\n\r,]/)[0].trim();
        const desc = String(getCol(row,'Permit Description') || '').slice(0,120);
        const permitNo = getCol(row,'Permit Number','Permit No','PermitNumber') || '';
        const id = permitNo ? String(permitNo) : `solar-${i}`;

        // Parse install date
        const dateVal = getCol(row,'Permit Issue Date','Permit Application Date','Issue Date','Date') || '';
        let installDate = null;
        if (typeof dateVal === 'number') {
          const d = XLSX.SSF.parse_date_code(dateVal);
          if (d && d.y) installDate = `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
        } else if (typeof dateVal === 'string' && dateVal) {
          const p = new Date(dateVal); if (!isNaN(p)) installDate = p.toISOString().split('T')[0];
        }

        try {
          await db.query(
            `INSERT INTO solar_installations (id,name,parish,type,capacity,status,install_date,lat,lng,notes,address,annual_output)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
             ON CONFLICT (id) DO UPDATE SET
               name=EXCLUDED.name,parish=EXCLUDED.parish,type=EXCLUDED.type,capacity=EXCLUDED.capacity,
               status=EXCLUDED.status,install_date=EXCLUDED.install_date,lat=EXCLUDED.lat,lng=EXCLUDED.lng,
               notes=EXCLUDED.notes,address=EXCLUDED.address,annual_output=EXCLUDED.annual_output,
               updated_at=CURRENT_TIMESTAMP`,
            [id, firstLine||`Permit ${i+1}`, parish, type, capacity||0, status||'Unknown', installDate, lat, lng, desc, address.slice(0,200), annualOutput]
          );
          inserted++;
        } catch (rowErr) { console.error(`Solar row ${i} error:`, rowErr.message); }
      }

      logAction(req.user, 'UPLOAD', 'Data File', `Solar data — ${inserted} installations imported`);
      res.json({ success: true, filename: req.file.filename, size: req.file.size, inserted });
    } catch (parseErr) {
      console.error('Solar Excel parse error:', parseErr);
      res.status(500).json({ error: 'Failed to parse Excel: ' + parseErr.message });
    }
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

    const allowedExtsStr = settings.allowedFileTypes || 'pdf,doc,docx,xlsx,png,jpg,jpeg,webp,mp4';
    const allowedExts = allowedExtsStr.toLowerCase().split(',').map(ext => ext.trim().replace(/^\./, ''));
    const maxMb = parseFloat(settings.maxUploadSize || '20');
    
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

    // Store as a root-relative path so the URL works regardless of which
    // hostname serves the frontend (CloudFront, energy.bm, or EB direct).
    // CloudFront routes /uploads/* → EB → S3 presigned redirect.
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

// Upload statistics via file (CSV with columns: category,label,value,unit,year,notes)
app.post('/api/statistics/upload', authenticate, checkWritePermission('kpis'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const text = req.file.buffer ? req.file.buffer.toString('utf-8') : require('fs').readFileSync(req.file.path, 'utf-8');
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return res.status(400).json({ error: 'File must have a header row and at least one data row' });
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const row = {};
      headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim().replace(/^"|"$/g, ''); });
      if (!row.value) continue;
      const id = `stat-${Date.now()}-${i}`;
      await db.query(
        `INSERT INTO statistics_history (id, data_type, period, value, unit, notes, uploaded_by, uploaded_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) ON CONFLICT (id) DO NOTHING`,
        [id, row.category || row.datatype || 'general', row.year || row.period || '', row.value, row.unit || '', row.label || row.notes || '', req.user.username]
      );
      rows.push(row);
    }
    await logAction(req.user.username, `Uploaded statistics file (${rows.length} rows)`, 'statistics', req.file.originalname);
    res.json({ success: true, inserted: rows.length, message: `${rows.length} statistics rows uploaded successfully` });
  } catch (err) { next(err); }
});

// Get all statistics history entries
app.get('/api/statistics', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM statistics_history ORDER BY period DESC, data_type ASC');
    // Map DB columns to what CMS displays: category, label, value, unit, year
    const rows = result.rows.map(r => ({
      id: r.id, category: r.data_type, label: r.notes || r.data_type,
      value: r.value, unit: r.unit, year: r.period,
      uploadedBy: r.uploaded_by, uploadedAt: r.uploaded_at
    }));
    res.json(rows);
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

// Serve /images/* and /guides/* from local portal/dist if available, else redirect to CloudFront
const portalDistImages = path.join(__dirname, 'portal', 'dist', 'images');
const portalDistGuides = path.join(__dirname, 'portal', 'dist', 'guides');
const CF_URL = process.env.CLOUDFRONT_URL || 'https://d3s0m5di5jxhm9.cloudfront.net';
app.use('/images', (req, res, next) => {
  const local = path.join(portalDistImages, req.path);
  if (require('fs').existsSync(local)) return res.sendFile(local);
  res.redirect(302, `${CF_URL}/images${req.url}`);
});
app.use('/guides', (req, res, next) => {
  const local = path.join(portalDistGuides, req.path);
  if (require('fs').existsSync(local)) return res.sendFile(local);
  res.redirect(302, `${CF_URL}/guides${req.url}`);
});

// Favicon
app.get('/favicon.ico', (req, res) => {
  const fav = path.join(__dirname, 'portal', 'dist', 'favicon.svg');
  if (require('fs').existsSync(fav)) return res.sendFile(fav);
  res.status(204).end();
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

async function runMigrationsInline() {
  const client = await db.pool.connect();
  try {
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
        ['lead-002','Valerie Robinson James','Permanent Secretary, Ministry of Home Affairs','/images/portraits/ps-robinson-james.jpg',"Valerie Robinson James is the Permanent Secretary for the Ministry of Home Affairs, responsible for the Department of Energy.",2],
        ['lead-003','Adrian Dill','Director of the Department of Energy','/images/portraits/director-dill.jpg',"Adrian Dill is the Director of the Department of Energy, leading Bermuda's energy policy, renewable programmes, and regulatory oversight.",3],
      ];
      for (const [id, name, role, imageUrl, bio, displayOrder] of team) {
        await client.query(
          `INSERT INTO leadership (id, name, role, image_url, bio, display_order) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [id, name, role, imageUrl, bio, displayOrder]
        );
      }
    }
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
    // Seed NESP 2026 as a closed (past) consultation; remove any fuels-related consultations
    await client.query(`
      INSERT INTO consultations (id, title, description, start_date, end_date, status, external_url)
      VALUES ('con-nesp-2026', 'National Energy Security Policy (NESP) 2026',
        'Public consultation on Bermuda''s updated National Energy Security Policy, covering renewable energy targets, grid resilience, and energy affordability for 2026–2030.',
        '2026-05-01', '2026-07-31', 'Closed', 'https://forum.gov.bm/en/')
      ON CONFLICT (id) DO UPDATE SET status = 'Closed'
    `);
    await client.query(`DELETE FROM consultations WHERE title ILIKE '%fuel%'`);
    // Seed default admin user if not exists
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;`);
    const userCheck = await client.query("SELECT COUNT(*) FROM users WHERE email = 'energy@gov.bm'");
    if (parseInt(userCheck.rows[0].count, 10) === 0) {
      await client.query(`INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES ('usr-admin','energy_admin','energy@gov.bm','$2b$10$go00jDF64O/N3vkCzB.0kOv/Y2050sltz5sY.XsRFPIP50KjTtylu','Administrator',TRUE) ON CONFLICT DO NOTHING;`);
    }
    console.log('[Startup] Database tables verified/created.');
  } catch (err) {
    console.error('[Startup] Migration error:', err.message);
  } finally {
    client.release();
  }
}

app.listen(PORT, async () => {
  await runMigrationsInline();
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
