require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db.cjs');
const { validate, schemas } = require('./server/validate.cjs');
const { sendMail } = require('./server/mailer.cjs');
const { applySchemaAndSeed } = require('./server/schema.cjs');

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
// Trust the first proxy (nginx / Elastic Beanstalk / CloudFront) so that
// req.secure, req.ip and express-rate-limit see the real client protocol/IP.
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8000;
const DEFAULT_JWT_SECRET = 'doe-secret-session-token-key-2026';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
// In production a strong, explicit secret is mandatory. A guessable default
// combined with the DB-unavailable auth fallback would allow token forgery.
if (process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_JWT_SECRET)) {
  console.error('FATAL: JWT_SECRET must be set to a strong, unique value in production.');
  process.exit(1);
}
const JWT_EXPIRES_IN = '2h';

// AWS S3 Configuration
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET || 'bermuda-doe-cms-uploads';
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
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
// Content-Security-Policy. `script-src` still needs 'unsafe-inline' because the
// CMS admin page (app.js) drives its UI with inline onclick handlers; removing
// that requires rewriting app.js to use addEventListener throughout. Everything
// else is locked down, so an injected string cannot pull in a remote script,
// embed a plugin, reframe the page, or exfiltrate to an arbitrary host.
const CSP_CONNECT_SRC = ["'self'", ...approvedOriginsForCsp()];
function approvedOriginsForCsp() {
  const list = (process.env.APPROVED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
  return list.includes('*') ? ['*'] : list;
}

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      'default-src': ["'self'"],
      'base-uri': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      // Map tiles (OpenStreetMap / Esri), S3 presigned uploads and CloudFront assets.
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'connect-src': CSP_CONNECT_SRC,
      // The CMS embeds the live public site in preview iframes; when that site is
      // on CloudFront it is a different origin and must be allowed explicitly.
      'frame-src': ["'self'", process.env.CLOUDFRONT_URL || 'https://d3s0m5di5jxhm9.cloudfront.net'],
      'frame-ancestors': ["'self'"],
      'object-src': ["'none'"],
      'form-action': ["'self'"],
      'upgrade-insecure-requests': [],
    },
  },
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
    // Approved origins (e.g. the CloudFront domain) come from APPROVED_ORIGINS
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
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Stricter limiter for unauthenticated public form submissions (spam/abuse guard)
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' }
});

// Session cookie options, used identically at login, refresh and sliding renewal.
// These previously disagreed (`sameSite: 'lax'` at login vs `'strict'` on renewal,
// and two different `secure` heuristics), so a renewed cookie could be rejected
// or silently downgraded mid-session.
function sessionCookieOptions(req) {
  const isLocalHost = Boolean(req.headers.host) &&
    (req.headers.host.startsWith('localhost') || req.headers.host.startsWith('127.0.0.1'));
  return {
    httpOnly: true,
    secure: !isLocalHost && (req.secure || req.headers['x-forwarded-proto'] === 'https'),
    sameSite: 'lax',
    maxAge: 2 * 60 * 60 * 1000,
    path: '/',
  };
}

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
      // Database unavailable — fail closed. Previously this trusted the JWT claims
      // directly (skipping the is_active / existence check), which turned any DB
      // blip into an auth-bypass that also honoured forged/stale role claims.
      console.error("Auth DB error:", dbErr.message);
      return res.status(503).json({ error: "Authentication service temporarily unavailable" });
    }

    req.user = user;

    // Renew token to implement sliding session on activity
    try {
      const newToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.cookie('token', newToken, sessionCookieOptions(req));
    } catch (tokenErr) {
      console.error("Failed to renew sliding session token:", tokenErr);
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

// Optional authentication: populates req.user when a valid token is present,
// but never rejects the request. Used on the public list feeds so that
// authenticated CMS staff receive every item (including drafts) while
// anonymous visitors only ever see published/live content.
function optionalAuthenticate(req, res, next) {
  let token = req.cookies.token;
  if (!token) {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
  } catch (err) {
    // Invalid/expired token on a public route — treat the caller as anonymous.
  }
  next();
}

// Statuses that represent pre-publication / embargoed / hidden content and must
// never be exposed on the unauthenticated public distribution feed.
const NON_PUBLIC_STATUSES = ['Draft', 'Scheduled', 'Pending', 'Hidden'];

// Public base URL for building links in outbound email (e.g. password reset).
function getServerBaseUrl(req) {
  if (process.env.APP_PUBLIC_DOMAIN) return `https://${process.env.APP_PUBLIC_DOMAIN}`;
  return `${req.protocol}://${req.get('host')}`;
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

// The role rules below are the same for every collection; the parameter is kept
// at the call sites for readability and so per-collection rules can be added
// here later without touching every route.
function checkWritePermission(_collectionName) {
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

// Collections whose tables carry a `status` column and therefore need the
// draft/embargo filter applied on the public feed. Used as the fail-closed
// default when live schema metadata is unavailable.
const COLLECTIONS_WITH_STATUS = new Set([
  'news', 'policies', 'consultations', 'projects', 'tracker', 'installers',
  'solarInstallations', 'innovation', 'staticPages', 'bursaries', 'leadership',
  'spaceContent', 'energyGuides', 'infographics', 'roadmaps',
]);

const TABLES_WITH_STATUS = new Set(
  [...COLLECTIONS_WITH_STATUS].map(c => collectionToTable[c]).filter(Boolean)
);

/**
 * Whether `tableName` has a `status` column, resolved from live schema metadata
 * when available and lazily loaded if the boot-time load did not populate it.
 * Falls back to the static list above so a metadata failure can never silently
 * disable the public draft filter.
 */
async function tableHasStatusColumn(tableName) {
  if (!tableColumns[tableName]) {
    try {
      const colsRes = await db.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1`,
        [tableName]
      );
      if (colsRes.rows.length > 0) {
        tableColumns[tableName] = colsRes.rows.map(r => r.column_name);
      }
    } catch (err) {
      console.error(`Could not resolve columns for ${tableName}:`, err.message);
    }
  }
  if (tableColumns[tableName]) {
    return tableColumns[tableName].includes('status');
  }
  return TABLES_WITH_STATUS.has(tableName);
}

// Collision-free identifier generator. The previous `${Date.now()}-${random}`
// scheme could collide inside a single millisecond (notably the bulk statistics
// import, which paired it with ON CONFLICT DO NOTHING and silently dropped rows).
const { randomUUID } = require('crypto');
function newId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

// Database logging helper (runs inside existing transactions when client is passed)
async function logAction(user, action, contentType, contentName, client = db) {
  try {
    const id = newId('log');
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

// ── FILE SIGNATURE ("magic byte") VERIFICATION ───────────────────────────────
// Maps an extension to the byte signatures a genuine file of that type starts
// with. Extensions absent from this table carry no reliable signature and are
// accepted on the extension allow-list alone.
const FILE_SIGNATURES = {
  png:  [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  gif:  [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  jpg:  [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  pdf:  [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  // OOXML containers (docx/xlsx/pptx) are ZIP archives.
  docx: [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06], [0x50, 0x4b, 0x07, 0x08]],
  xlsx: [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06], [0x50, 0x4b, 0x07, 0x08]],
  // Legacy OLE2 compound document (.doc/.xls).
  doc:  [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]],
  xls:  [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]],
};

// WebP and MP4 need a second check further into the header.
function matchesContainer(head, ext) {
  const ascii = (start, len) => head.slice(start, start + len).toString('ascii');
  if (ext === 'webp') return ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP';
  if (ext === 'mp4')  return ascii(4, 4) === 'ftyp';
  return null;
}

/**
 * Returns null when the file's leading bytes are consistent with `ext`,
 * otherwise a human-readable reason string.
 */
function verifyFileSignature(filePath, ext) {
  let head;
  try {
    const fd = fs.openSync(filePath, 'r');
    head = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, head, 0, 16, 0);
    fs.closeSync(fd);
    head = head.slice(0, bytesRead);
  } catch (err) {
    return 'the uploaded file could not be read for verification';
  }

  const container = matchesContainer(head, ext);
  if (container !== null) {
    return container ? null : `file contents do not match the .${ext} extension`;
  }

  const signatures = FILE_SIGNATURES[ext];
  if (!signatures) return null; // No known signature for this type.

  const ok = signatures.some(sig =>
    head.length >= sig.length && sig.every((byte, i) => head[i] === byte)
  );
  return ok ? null : `file contents do not match the .${ext} extension`;
}

// Server-side data files (source spreadsheets for the fleet/solar importers).
// These deliberately live outside any `public/` directory: `.ebignore` excludes
// `public/` at every depth, so the previous `portal/public/documents` location
// was silently absent from every Elastic Beanstalk deployment.
const DATA_DIR = path.join(__dirname, 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
    // Suffix with a UUID, not a timestamp — two uploads of the same filename in
    // the same millisecond would otherwise overwrite each other in S3.
    cb(null, `${basename}-${randomUUID()}${ext}`);
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
  
  // Always return 200 so the Elastic Beanstalk / load-balancer health checks pass even when DB is degraded
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

  // Reject path-traversal attempts — only a bare filename is ever valid here.
  if (!filename || filename.includes('/') || filename.includes('\\') ||
      filename.includes('..') || path.isAbsolute(filename)) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  // Allow configured origins (e.g. the CloudFront frontend) to load images cross-origin
  const origin = req.headers.origin;
  const allowed = allowAllOrigins || !origin ||
    approvedOrigins.includes(origin);
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
      // Database unavailable — fail closed. Previously this fell back to a
      // hardcoded demo admin (energy@gov.bm / bermuda2026), which allowed anyone
      // to authenticate as Administrator whenever the DB errored. Never do that.
      console.error("Login DB error:", dbErr.message);
      return res.status(503).json({ error: "Authentication service temporarily unavailable" });
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
    
    res.cookie('token', token, sessionCookieOptions(req));

    await logAction(user.username, "Logged in successfully", "auth", user.username);

    // The token is deliberately NOT returned in the body. It is delivered only as
    // an httpOnly cookie so that a script injection cannot read or exfiltrate it.
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

    // Deliver the reset link/token by email only. The token is never returned in
    // the API response (even in dev) to avoid leaking it via response logging.
    const resetLink = `${getServerBaseUrl(req)}/?reset_token=${token}`;
    sendMail({
      to: user.email,
      subject: 'Bermuda Department of Energy — Password Reset',
      text: `A password reset was requested for your Energy CMS account.\n\n`
        + `Open this link to set a new password (valid for 1 hour):\n${resetLink}\n\n`
        + `Or enter this token on the reset screen:\n${token}\n\n`
        + `If you did not request this, you can safely ignore this email.`,
      html: `<p>A password reset was requested for your Energy CMS account.</p>`
        + `<p><a href="${resetLink}">Click here to set a new password</a> (valid for 1 hour).</p>`
        + `<p>Or enter this token on the reset screen:</p>`
        + `<p style="font-family:monospace;font-size:15px;background:#f1f5f9;padding:8px 12px;border-radius:6px;">${token}</p>`
        + `<p>If you did not request this, you can safely ignore this email.</p>`,
    }).catch(err => console.error('Reset email dispatch error:', err));

    res.json({
      success: true,
      message: "If this email matches an authorized staff account, reset instructions will be sent shortly."
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/reset-password', validate(schemas.resetPassword), async (req, res, next) => {
  const { token, newPassword } = req.body;
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
  // Clearing must use matching attributes or the browser keeps the cookie.
  const { maxAge, ...clearOpts } = sessionCookieOptions(req);
  res.clearCookie('token', clearOpts);
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
    res.cookie('token', newToken, sessionCookieOptions(req));
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json(req.user);
});

// Change your own password (any authenticated role).
app.put('/api/auth/password', authenticate, validate(schemas.changePassword), async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!bcrypt.compareSync(currentPassword, result.rows[0].password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [bcrypt.hashSync(newPassword, 10), req.user.id]
    );
    await logAction(req.user.username, 'Changed own password', 'auth', req.user.username);
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// ── USER MANAGEMENT (Administrator only) ─────────────────────────────────────
// Without these routes the four-role RBAC system was unusable: the only account
// that could ever exist was the one created by the startup seed.
const USER_COLUMNS = 'id, username, email, role, is_active, created_at, updated_at';

app.get('/api/users', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const result = await db.query(`SELECT ${USER_COLUMNS} FROM users ORDER BY username ASC`);
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

app.post('/api/users', authenticate, authorize('Administrator'), validate(schemas.createUser), async (req, res, next) => {
  const { username, email, password, role, isActive } = req.body;
  try {
    const id = newId('usr');
    const result = await db.query(
      `INSERT INTO users (id, username, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${USER_COLUMNS}`,
      [id, username, email, bcrypt.hashSync(password, 10), role, isActive]
    );
    await logAction(req.user.username, `Created user (${role})`, 'users', username);
    res.status(201).json({ success: true, user: db.snakeToCamel(result.rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username or email is already in use' });
    }
    next(err);
  }
});

app.put('/api/users/:id', authenticate, authorize('Administrator'), validate(schemas.updateUser), async (req, res, next) => {
  const targetId = req.params.id;
  const { username, email, password, role, isActive } = req.body;
  try {
    const existing = await db.query('SELECT id, username, role, is_active FROM users WHERE id = $1', [targetId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const current = db.snakeToCamel(existing.rows[0]);

    // Never let the last active administrator demote or deactivate themselves out
    // of existence — that would lock everyone out of user management permanently.
    const losingAdmin =
      current.role === 'Administrator' &&
      ((role !== undefined && role !== 'Administrator') || isActive === false);
    if (losingAdmin) {
      const admins = await db.query(
        "SELECT COUNT(*)::int AS count FROM users WHERE role = 'Administrator' AND is_active = TRUE AND id <> $1",
        [targetId]
      );
      if (admins.rows[0].count === 0) {
        return res.status(409).json({ error: 'Cannot remove the last active administrator' });
      }
    }

    const sets = [];
    const values = [];
    const push = (col, val) => { values.push(val); sets.push(`${col} = $${values.length}`); };
    if (username !== undefined) push('username', username);
    if (email !== undefined) push('email', email);
    if (role !== undefined) push('role', role);
    if (isActive !== undefined) push('is_active', isActive);
    if (password !== undefined) push('password_hash', bcrypt.hashSync(password, 10));
    if (sets.length === 0) {
      return res.status(400).json({ error: 'No changes supplied' });
    }
    sets.push('updated_at = CURRENT_TIMESTAMP');

    values.push(targetId);
    const result = await db.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING ${USER_COLUMNS}`,
      values
    );
    await logAction(req.user.username, 'Updated user', 'users', current.username);
    res.json({ success: true, user: db.snakeToCamel(result.rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username or email is already in use' });
    }
    next(err);
  }
});

app.delete('/api/users/:id', authenticate, authorize('Administrator'), async (req, res, next) => {
  const targetId = req.params.id;
  try {
    if (targetId === req.user.id) {
      return res.status(409).json({ error: 'You cannot delete your own account' });
    }
    const existing = await db.query('SELECT username, role FROM users WHERE id = $1', [targetId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (existing.rows[0].role === 'Administrator') {
      const admins = await db.query(
        "SELECT COUNT(*)::int AS count FROM users WHERE role = 'Administrator' AND is_active = TRUE AND id <> $1",
        [targetId]
      );
      if (admins.rows[0].count === 0) {
        return res.status(409).json({ error: 'Cannot delete the last active administrator' });
      }
    }
    await db.query('DELETE FROM users WHERE id = $1', [targetId]);
    await logAction(req.user.username, 'Deleted user', 'users', existing.rows[0].username);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
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
    const filePath = path.join(DATA_DIR, 'Vehicles by Fuel Type.xls');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'No fleet data available. Upload the vehicles spreadsheet in the CMS.' });
    }
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
      // install_date is selected but was omitted from this projection, so the GIS
      // layer and the CMS data preview both rendered "—" for every issue date
      // even though the column was populated.
      installDate: row.install_date instanceof Date
        ? row.install_date.toISOString().split('T')[0]
        : (row.install_date || null),
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
  const result = Object.entries(DATA_FILES).map(([key, meta]) => {
    const filePath = path.join(DATA_DIR, meta.filename);
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
      fs.mkdirSync(DATA_DIR, { recursive: true });
      cb(null, DATA_DIR);
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
        logAction(req.user.username, 'UPLOAD', 'Data File', `Vehicles fleet — ${fleetData.total} records imported`);
        return res.json({ success: true, filename: req.file.filename, size: req.file.size, total: fleetData.total });
      } catch (parseErr) {
        console.error('Vehicles Excel parse error:', parseErr);
        logAction(req.user.username, 'UPLOAD', 'Data File', DATA_FILES[key].label);
        return res.json({ success: true, filename: req.file.filename, size: req.file.size });
      }
    }

    if (key !== 'solar') {
      logAction(req.user.username, 'UPLOAD', 'Data File', DATA_FILES[key].label);
      return res.json({ success: true, filename: req.file.filename, size: req.file.size });
    }

    // Solar upload: parse Excel and persist rows to PostgreSQL
    try {
      const XLSX = require('xlsx');
      const wb = XLSX.readFile(req.file.path);

      // Pick the sheet that actually holds permit records. Exported workbooks
      // frequently lead with a pivot-table "Summary" sheet, and blindly taking
      // SheetNames[0] would import a handful of aggregate rows — after the
      // TRUNCATE had already discarded the real registry.
      const pickDataSheet = () => {
        for (const name of wb.SheetNames) {
          const head = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' })[0] || [];
          const norm = head.map(h => String(h).toLowerCase().trim());
          if (norm.includes('permit number') || norm.includes('permit no') || norm.includes('permitnumber')) {
            return name;
          }
        }
        return wb.SheetNames[0];
      };
      const sheetName = pickDataSheet();
      if (sheetName !== wb.SheetNames[0]) {
        console.log(`[Solar import] Using sheet "${sheetName}" (skipped "${wb.SheetNames[0]}").`);
      }
      const ws = wb.Sheets[sheetName];

      // Use header:1 to get raw arrays so we can handle duplicate column names (two lat/lon pairs)
      const rawArr = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const headers = rawArr[0] || [];
      const raw = rawArr.slice(1).map(r => {
        const obj = {};
        headers.forEach((h, i) => { if (h) obj[h] = r[i] ?? ''; });
        return obj;
      });

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

      // Ensure extra columns exist (DDL, idempotent, outside the data transaction)
      await db.query(`ALTER TABLE solar_installations ADD COLUMN IF NOT EXISTS annual_output NUMERIC DEFAULT 0`);
      await db.query(`ALTER TABLE solar_installations ADD COLUMN IF NOT EXISTS address TEXT`);

      // TRUNCATE + reload runs as one transaction. Previously the truncate was
      // committed immediately and rows were inserted one-by-one with per-row
      // errors swallowed, so a mid-import failure left the registry (and every
      // page that reads it) permanently half-populated with no way back.
      // Resolve the coordinate columns once, up front. Exports label these
      // inconsistently ("lat"/"lon" in one extract, "latitude"/"longitude" in
      // another); matching only the short form silently produced a registry with
      // no real coordinates, where every marker fell back to a jittered parish
      // centroid. Some workbooks carry two pairs, so keep first/last of each.
      const findCoordCols = (names) => {
        const norm = headers.map(h => String(h).toLowerCase().trim());
        for (const n of names) {
          const first = norm.indexOf(n);
          if (first !== -1) return { first, last: norm.lastIndexOf(n) };
        }
        return { first: -1, last: -1 };
      };
      const latCols = findCoordCols(['lat', 'latitude', 'y']);
      const lonCols = findCoordCols(['lon', 'lng', 'long', 'longitude', 'x']);
      if (latCols.first === -1 || lonCols.first === -1) {
        console.warn('[Solar import] No coordinate columns found — markers will fall back to parish centroids.');
      }

      const skipped = [];
      const filteredOut = [];
      const inserted = await db.executeTransaction(async (client) => {
      await client.query('TRUNCATE solar_installations');

      let count = 0;
      for (let i = 0; i < raw.length; i++) {
        const row = raw[i];
        // Read coordinates by raw array index so duplicate column names both stay
        // reachable. Prefer the primary pair; fall back to the secondary pair for
        // records whose primary columns are blank but which were geocoded later.
        const rawRow = rawArr[i + 1] || [];
        const pick = (cols) => {
          const a = cols.first >= 0 ? rawRow[cols.first] : '';
          if (a !== '' && a != null) return a;
          const b = cols.last >= 0 ? rawRow[cols.last] : '';
          return (b !== '' && b != null) ? b : '';
        };
        const rawLat = pick(latCols);
        const rawLng = pick(lonCols);
        const parsedLat = parseFloat(String(rawLat).trim());
        let parsedLng = parseFloat(String(rawLng).trim());
        if (Number.isFinite(parsedLng) && parsedLng > 0 && parsedLng < 70) parsedLng = -parsedLng;
        const hasCoords = Number.isFinite(parsedLat) && Number.isFinite(parsedLng) && parsedLat !== 0 && parsedLng !== 0;

        const status = String(getCol(row,'Permit Status') || '').trim();
        const permitNoRaw = String(getCol(row,'Permit Number','Permit No','PermitNumber') || '').trim();
        const addressRaw = String(getCol(row,'Adresss','Address','Permit Address','address') || '').trim();
        const capacityRaw = String(getCol(row,'Extracted AC Capacity (kW)','Extracted AC Capacity','AC Capacity (kW)','AC Capacity','Capacity (kW)','Capacity','capacity') || '').trim();

        // A record with neither a location nor an active permit status cannot be
        // placed on the map and is not a live installation — skip it, but record
        // why so the import totals are explainable rather than silently short.
        if (!hasCoords && !ACTIVE.has(status)) {
          filteredOut.push({
            row: i + 2,
            id: permitNoRaw || '(blank)',
            reason: status ? `no coordinates and status "${status}"` : 'blank row',
          });
          continue;
        }

        // A stray coordinate pair with no permit number, address, capacity or
        // status carries no information. Such rows were previously imported as
        // "Permit N / 0 kW / Unknown" placeholders and shown to the public on the
        // official Renewable Energy Registry.
        if (!permitNoRaw && !addressRaw && !capacityRaw && !status) {
          filteredOut.push({ row: i + 2, id: '(blank)', reason: 'coordinates only — no permit data' });
          continue;
        }

        let parish = String(getCol(row,'Permit District','Parish','District') || 'Bermuda').trim();
        parish = PARISH_MAP[parish] ?? parish;

        let lat, lng;
        if (hasCoords) { lat = parsedLat; lng = parsedLng; }
        else { const c = PARISH_COORDS[parish] || PARISH_COORDS['Bermuda']; lat = c[0]+Math.sin(i*7.3)*0.003; lng = c[1]+Math.cos(i*5.1)*0.003; }
        if (parish === 'Bermuda') parish = nearestParish(lat, lng);

        const rawCap = getCol(row,'Extracted AC Capacity (kW)','Extracted AC Capacity','AC Capacity (kW)','AC Capacity','Capacity (kW)','Capacity','capacity');
        let capacity = parseFloat(String(rawCap).trim());
        if (!Number.isFinite(capacity) || capacity <= 0) {
          const desc2 = String(getCol(row,'Permit Description') || '');
          // Match kW but NOT kWh (avoid treating annual output as capacity)
          const m2 = desc2.match(/(\d+\.?\d*)\s*kw(?!h)/i);
          capacity = m2 ? parseFloat(m2[1]) : 0;
        }
        // Only convert if clearly in watts (>10000W = >10kW), never for MW-scale systems
        if (capacity > 10000) capacity = capacity / 1000;

        let annualOutput = parseFloat(String(getCol(row,'Annual Output (kWh)','Annual Output','Annual Output kWh') || 0)) || 0;
        if (!annualOutput) {
          // Some extracts carry no Annual Output column but state it in the permit
          // description, e.g. "System Capacity - 5.325, Annual Output - 7790h."
          const descOut = String(getCol(row,'Permit Description') || '');
          const mOut = descOut.match(/annual\s*output\s*[-:]?\s*([\d,]+\.?\d*)/i);
          if (mOut) annualOutput = parseFloat(mOut[1].replace(/,/g, '')) || 0;
        }
        const wc = String(getCol(row,'Permit Work Class','Permit Type','Work Class') || '').toLowerCase();
        // Utility = explicitly utility class OR capacity >500kW regardless of permit class
        const typeFromWC = wc.includes('commercial') ? 'Commercial' : wc.includes('utility') ? 'Utility' : 'Residential';
        const type = (capacity > 500) ? 'Utility' : typeFromWC;
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

        // A malformed row must not abort the whole import, but it is recorded and
        // reported rather than silently dropped. Each row runs in a SAVEPOINT so a
        // failure doesn't poison the surrounding transaction.
        await client.query('SAVEPOINT solar_row');
        try {
          await client.query(
            `INSERT INTO solar_installations (id,name,parish,type,capacity,status,install_date,lat,lng,notes,address,annual_output)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
             ON CONFLICT (id) DO UPDATE SET
               name=EXCLUDED.name,parish=EXCLUDED.parish,type=EXCLUDED.type,capacity=EXCLUDED.capacity,
               status=EXCLUDED.status,install_date=EXCLUDED.install_date,lat=EXCLUDED.lat,lng=EXCLUDED.lng,
               notes=EXCLUDED.notes,address=EXCLUDED.address,annual_output=EXCLUDED.annual_output,
               updated_at=CURRENT_TIMESTAMP`,
            [id, firstLine||`Permit ${i+1}`, parish, type, capacity||0, status||'Unknown', installDate, lat, lng, desc, address.slice(0,200), annualOutput]
          );
          await client.query('RELEASE SAVEPOINT solar_row');
          count++;
        } catch (rowErr) {
          await client.query('ROLLBACK TO SAVEPOINT solar_row');
          console.error(`Solar row ${i} error:`, rowErr.message);
          skipped.push({ row: i + 2, id, reason: rowErr.message });
        }
      }
      return count;
      });

      if (skipped.length > 0) {
        console.warn(`[Solar import] ${skipped.length} row(s) failed to insert.`);
      }
      if (filteredOut.length > 0) {
        console.log(`[Solar import] ${filteredOut.length} row(s) excluded (no location and not an active permit).`);
      }
      logAction(
        req.user.username, 'UPLOAD', 'Data File',
        `Solar data — ${inserted} imported, ${filteredOut.length} excluded, ${skipped.length} failed`
      );
      res.json({
        success: true,
        filename: req.file.filename,
        size: req.file.size,
        sheet: sheetName,
        totalRows: raw.length,
        inserted,
        excluded: filteredOut.length,
        excludedRows: filteredOut.slice(0, 20),
        skipped: skipped.length,
        skippedRows: skipped.slice(0, 20),
      });
    } catch (parseErr) {
      console.error('Solar Excel parse error:', parseErr);
      res.status(500).json({ error: 'Failed to parse Excel: ' + parseErr.message });
    }
  });
});

// ── PUBLIC CONTACT & NEWSLETTER ENDPOINTS ────────────────────────────────────
app.post('/api/contact', publicFormLimiter, validate(schemas.contact), async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    const id = newId('contact');
    // Persist so CMS staff can retrieve submissions (no longer lost to the console).
    await db.query(
      `INSERT INTO contact_submissions (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)`,
      [id, name, email, subject || 'General Enquiry', message]
    );
    await logAction(email, 'Contact form submission', 'contact', `${name} — ${subject || 'General Enquiry'}`);

    // Best-effort notification to the department inbox (never blocks the response).
    try {
      const settingsRes = await db.query('SELECT contact_email FROM settings WHERE id = 1');
      const notifyTo = settingsRes.rows[0]?.contact_email || process.env.CONTACT_NOTIFY_EMAIL;
      if (notifyTo) {
        sendMail({
          to: notifyTo,
          subject: `New contact enquiry: ${subject || 'General Enquiry'}`,
          text: `From: ${name} <${email}>\nSubject: ${subject || 'General Enquiry'}\n\n${message}`,
        }).catch(() => {});
      }
    } catch (_) { /* notification is optional */ }

    res.json({ success: true, message: 'Your message has been received. We will respond within 3 business days.' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/newsletter', publicFormLimiter, validate(schemas.newsletter), async (req, res, next) => {
  try {
    const { email } = req.body;
    const id = newId('sub');
    // Persist the subscriber (idempotent on email) so the list survives restarts.
    await db.query(
      `INSERT INTO newsletter_subscribers (id, email) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET status = 'Subscribed'`,
      [id, email]
    );
    await logAction(email, 'Newsletter subscription', 'newsletter', email);
    res.json({ success: true, message: 'Thank you for subscribing to energy updates.' });
  } catch (err) {
    next(err);
  }
});

// ── CMS RETRIEVAL: form submissions (authenticated staff) ─────────────────────
app.get('/api/contact-submissions', authenticate, authorize('Approver', 'Administrator'), async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM contact_submissions ORDER BY submitted_at DESC');
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

app.delete('/api/contact-submissions/:id', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    await db.query('DELETE FROM contact_submissions WHERE id = $1', [req.params.id]);
    await logAction(req.user.username, 'Deleted contact submission', 'contact', req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/newsletter-subscribers', authenticate, authorize('Approver', 'Administrator'), async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

// ── SITE IMAGES ──────────────────────────────────────────────────────────────
// Every image slot on the public site is registered in `site_images` (seeded
// from server/site-images.cjs). Staff upload replacements here and the public
// site merges the overrides over its bundled defaults — no redeploy needed.

// Public: only the overrides, keyed for a cheap merge on the frontend.
app.get('/api/site-images', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT key, url FROM site_images WHERE url IS NOT NULL AND url <> ''`
    );
    const map = {};
    for (const row of result.rows) map[row.key] = row.url;
    res.set('Cache-Control', 'public, max-age=60');
    res.json(map);
  } catch (err) {
    // Never break the public site over this — it degrades to bundled defaults.
    console.error('site-images fetch error:', err.message);
    res.json({});
  }
});

// CMS: full registry with metadata, for the Site Images management screen.
app.get('/api/site-images/manage', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT key, group_name, label, description, default_url, recommended,
              sort_order, url, updated_by, updated_at
       FROM site_images ORDER BY sort_order ASC`
    );
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

// Set (or clear) the override for one slot.
app.put('/api/site-images/:key', authenticate, checkWritePermission('siteImages'), async (req, res, next) => {
  try {
    const { key } = req.params;
    const url = typeof req.body.url === 'string' ? req.body.url.trim() : '';
    const exists = await db.query('SELECT label FROM site_images WHERE key = $1', [key]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Unknown image slot' });
    }
    const result = await db.query(
      `UPDATE site_images
       SET url = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
       WHERE key = $3 RETURNING *`,
      [url || null, req.user.username, key]
    );
    await logAction(
      req.user.username,
      url ? 'Updated site image' : 'Reset site image to default',
      'siteImages', exists.rows[0].label || key
    );
    res.json({ success: true, image: db.snakeToCamel(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/site-images/:key', authenticate, checkWritePermission('siteImages'), async (req, res, next) => {
  try {
    const { key } = req.params;
    const result = await db.query(
      `UPDATE site_images SET url = NULL, updated_by = $1, updated_at = CURRENT_TIMESTAMP
       WHERE key = $2 RETURNING label`,
      [req.user.username, key]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Unknown image slot' });
    }
    await logAction(req.user.username, 'Reset site image to default', 'siteImages', result.rows[0].label || key);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── SYSTEM CONFIGURATION & DATA API ENDPOINTS ───────────────────────────────
app.get('/api/db', authenticate, async (req, res, next) => {
  try {
    const data = await getFullDb();
    // Audit logs, version history and the recycle bin are Administrator-only via
    // their dedicated routes; don't hand them to every authenticated Viewer here.
    if (req.user.role !== 'Administrator') {
      delete data.logs;
      delete data.versions;
      delete data.recycleBin;
    }
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

    // Only allow keys that are real columns on the settings table. This prevents
    // both a SQL syntax error (unknown column) and a SQL-injection sink from
    // interpolating arbitrary body keys as column names.
    const allowed = tableColumns['settings'] || [];
    const keys = Object.keys(dbItem).filter(k => allowed.includes(k) && k !== 'id');

    // Make sure the singleton row exists (defensive — also seeded at startup).
    await db.query(`INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);

    if (keys.length > 0) {
      const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = keys.map(k => dbItem[k]);
      await db.query(`UPDATE settings SET ${setClauses} WHERE id = 1`, values);
    }

    const result = await db.query('SELECT * FROM settings WHERE id = 1');
    const { id, ...updatedSettings } = result.rows[0] || {};

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
  app.get(`/api/${collectionName}`, optionalAuthenticate, async (req, res, next) => {
    try {
      const orderBy = getCollectionOrderBy(collectionName);
      // Anonymous callers only receive published/live content; authenticated CMS
      // staff receive every row (including drafts) for management.
      //
      // This must fail CLOSED. It previously read `tableColumns` directly, which
      // is populated once at boot by fetchTableColumns() — and that function
      // swallows its own errors. If the metadata load failed (or simply hadn't
      // finished), every table looked like it had no `status` column and the
      // filter was skipped entirely, publishing drafts to anonymous visitors.
      const hasStatus = await tableHasStatusColumn(tableName);
      let queryText = `SELECT * FROM ${tableName}`;
      const params = [];
      if (!req.user && hasStatus) {
        const placeholders = NON_PUBLIC_STATUSES.map((_, i) => `$${i + 1}`).join(', ');
        queryText += ` WHERE (status IS NULL OR status NOT IN (${placeholders}))`;
        params.push(...NON_PUBLIC_STATUSES);
      }
      queryText += ` ORDER BY ${orderBy}`;
      const result = await db.query(queryText, params);
      res.json(db.snakeToCamel(result.rows));
    } catch (err) {
      next(err);
    }
  });

  // POST Create
  app.post(`/api/${collectionName}`, authenticate, checkWritePermission(collectionName), async (req, res, next) => {
    try {
      const id = newId(collectionName.slice(0, 3));
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

        // Editors may not modify content that is already published/live, nor
        // transition an item into a published/live state. This is defence in
        // depth on top of checkWritePermission, which only sees the incoming
        // status and would otherwise allow edits when status is omitted.
        if (req.user.role === 'Editor') {
          const RESTRICTED = ['Published', 'Approved', 'In Force', 'Open', 'Completed'];
          const resultingStatus = req.body.status !== undefined ? req.body.status : currentItem.status;
          if (RESTRICTED.includes(currentItem.status) || RESTRICTED.includes(resultingStatus)) {
            const e = new Error('EDITOR_FORBIDDEN');
            e.code = 'EDITOR_FORBIDDEN';
            throw e;
          }
        }

        // Versioning for eligible collections
        if (['policies', 'consultations', 'staticPages'].includes(collectionName)) {
          const verRes = await client.query(
            `SELECT COUNT(*)::int as count FROM versions WHERE item_id = $1`,
            [id]
          );
          const nextVerNum = verRes.rows[0].count + 1;
          const verId = newId('ver');
          
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
      if (err.code === 'EDITOR_FORBIDDEN' || err.message === 'EDITOR_FORBIDDEN') {
        return res.status(403).json({ error: "Forbidden: Editor role cannot modify published or approved content." });
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

        const recycleId = newId('recycle');
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
      const newVerId = newId('ver');

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
    
    // ── SECURITY VALIDATION: verify the real file signature ────────────────────
    // This previously checked req.file.mimetype, which is just the browser-supplied
    // Content-Type header and is fully attacker-controlled — so a .png could hold
    // anything. Now the file's own leading bytes must match the extension.
    const sigError = verifyFileSignature(req.file.path, fileExt);
    if (sigError) {
      try { fs.unlinkSync(req.file.path); } catch (err) {}
      return res.status(400).json({ error: `Security check failed: ${sigError}` });
    }

    // ── VIRUS SCAN INTEGRATION POINT ─────────────────────────────────────────
    // Hook for an ICAP/ClamAV daemon. Nothing is scanned today, so this must not
    // claim otherwise — the previous line logged "Result: CLEAN" unconditionally,
    // which would read as evidence of a scan that never ran.
    if (process.env.AV_SCAN_URL) {
      console.warn(`[Security Audit] AV_SCAN_URL is set but no scanner is wired up yet; ${req.file.originalname} was NOT scanned.`);
    }

    // Store as a root-relative path so the URL works regardless of which
    // hostname serves the frontend (CloudFront, energy.bm, or EB direct).
    // CloudFront routes /uploads/* → EB → S3 presigned redirect.
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileSizeMbStr = fileSizeMb.toFixed(2) + ' MB';
    const mediaId = newId('med');
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
      const id = newId('stat');
      await db.query(
        `INSERT INTO statistics_history (id, data_type, period, value, unit, notes, uploaded_by, uploaded_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) ON CONFLICT (id) DO NOTHING`,
        [id, row.category || row.datatype || 'general', row.year || row.period || '', row.value, row.unit || '', row.label || row.notes || '', req.user.username]
      );
      rows.push(row);
    }
    await logAction(req.user.username, `Uploaded statistics file (${rows.length} rows)`, 'statistics', req.file.originalname);
    res.json({ success: true, inserted: rows.length, message: `${rows.length} statistics rows uploaded successfully` });
  } catch (err) {
    next(err);
  } finally {
    // This route uses disk-storage multer; remove the temp CSV so uploads/ doesn't
    // accumulate orphaned files on every import.
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
  }
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
    const id = newId('stat');
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
      const id = newId('stat');
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

// ── PUBLIC SPA ────────────────────────────────────────────────────────────────
// The React site is built from the canonical `src/` tree into `dist/`. On AWS it
// is served from S3/CloudFront and `dist/` is absent here (excluded by
// .ebignore); in Docker/self-hosted mode Express serves it directly.
// `portal/` was a stale second copy of the same app and is no longer referenced.
const SPA_DIST = path.join(__dirname, 'dist');
const spaBuilt = fs.existsSync(path.join(SPA_DIST, 'index.html'));
if (spaBuilt) {
  console.log('[Startup] Serving the public SPA from ./dist');
} else {
  console.log('[Startup] No ./dist build found — the public SPA is expected to be served by CloudFront/S3.');
}

app.use('/portal', express.static(SPA_DIST));

// Fallback all other portal routes to index.html for React Router SPA
app.get(/^\/portal(?:\/.*)?$/, (req, res) => {
  const indexPath = path.join(SPA_DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).json({ error: 'The public site build is not present on this server.' });
  }
  res.sendFile(indexPath);
});

// Serve /images/* and /guides/* from the local build if available, else redirect to CloudFront
const distImages = path.join(SPA_DIST, 'images');
const distGuides = path.join(SPA_DIST, 'guides');
const CF_URL = process.env.CLOUDFRONT_URL || 'https://d3s0m5di5jxhm9.cloudfront.net';
app.use('/images', (req, res, next) => {
  const local = path.join(distImages, req.path);
  if (fs.existsSync(local)) return res.sendFile(local);
  res.redirect(302, `${CF_URL}/images${req.url}`);
});
app.use('/guides', (req, res, next) => {
  const local = path.join(distGuides, req.path);
  if (fs.existsSync(local)) return res.sendFile(local);
  res.redirect(302, `${CF_URL}/guides${req.url}`);
});

// Favicon
app.get('/favicon.ico', (req, res) => {
  const fav = path.join(SPA_DIST, 'favicon.svg');
  if (fs.existsSync(fav)) return res.sendFile(fav);
  res.status(204).end();
});

// Serve root homepage statically (Admin CMS)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cms-admin.html'));
});

// Serve ONLY the specific root assets the CMS admin page needs.
// Previously this was `express.static(__dirname)`, which served the entire
// project directory — exposing server.cjs/db.cjs source, package.json,
// .env.example, the committed spreadsheets, and the seeded admin bcrypt hash
// to any unauthenticated visitor. Now restricted to an explicit whitelist.
const ROOT_STATIC_WHITELIST = new Set([
  '/app.js', '/styles.css', '/cms-admin.html', '/logo.png',
]);
app.use((req, res, next) => {
  if (req.method === 'GET' && ROOT_STATIC_WHITELIST.has(req.path)) {
    const filePath = path.join(__dirname, req.path);
    // Fall through to the 404 rather than throwing an ENOENT into the error
    // handler if a whitelisted asset is missing from the deployment.
    if (!fs.existsSync(filePath)) return next();
    return res.sendFile(filePath);
  }
  next();
});

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
    // Schema + first-run seed live in server/schema.cjs so that this startup path
    // and `npm run migrate` cannot drift apart.
    await applySchemaAndSeed(client);
  } catch (err) {
    console.error('[Startup] Migration error:', err.message);
  } finally {
    client.release();
  }
}

async function start() {
  await runMigrationsInline();
  await fetchTableColumns();
  try {
    await runPostgresScheduler();
    // Run the publish/expiry scheduler every 5 minutes so scheduled content goes
    // live close to its target time. (Previously this only ran on startup + every
    // 24h, and was additionally invoked on every public GET, which was costly.)
    setInterval(() => {
      runPostgresScheduler().catch(err => console.error("Scheduled scheduler run failed:", err));
    }, 5 * 60 * 1000);
  } catch (err) {
    console.error("Failed to run startup scheduler:", err);
  }
}

// Only bind a port when run directly (`node server.cjs`). Importing this module —
// which the test suite does — must not open a listener or start the scheduler.
if (require.main === module) {
  app.listen(PORT, async () => {
    await start();
    console.log(`Bermuda DoE CMS Server running at http://localhost:${PORT}`);
  });
}

module.exports = { app, start, verifyFileSignature, sessionCookieOptions, newId };
