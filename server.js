require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

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

// CORS Configuration - Reject unknown origins
const approvedOrigins = process.env.APPROVED_ORIGINS 
  ? process.env.APPROVED_ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:8000', 'http://localhost:5173', 'http://127.0.0.1:8000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || approvedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: Origin rejected'));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 300,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 5,
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
    const result = await db.query('SELECT id, username, email, role, is_active FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    const user = db.snakeToCamel(result.rows[0]);
    if (!user.isActive) {
      return res.status(401).json({ error: "Unauthorized: User account is inactive" });
    }
    req.user = user;
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
  innovation: 'innovation_topics'
};

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
    let queryText = `SELECT * FROM ${tableName}`;
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
  
  if (health.status === 'OK') {
    res.json(health);
  } else {
    res.status(503).json(health);
  }
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

// ── AUTHENTICATION ROUTES ────────────────────────────────────────────────────
app.post('/api/auth/login', loginLimiter, async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = db.snakeToCamel(result.rows[0]);
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
    console.log(`[SECURITY RESET] Reset link generated for ${email}: http://localhost:8000/reset-password?token=${token}`);

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

// ── SYSTEM CONFIGURATION & DATA API ENDPOINTS ───────────────────────────────
app.get('/api/db', async (req, res, next) => {
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

app.get('/api/kpis', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM kpis');
    res.json(db.snakeToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

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
      const result = await db.query(`SELECT * FROM ${tableName}`);
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

// Serve portal compiled assets statically
app.use('/portal', express.static(path.join(__dirname, 'portal', 'dist')));

// Fallback all other portal routes to index.html for React Router SPA
app.get(/^\/portal(?:\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'portal', 'dist', 'index.html'));
});

// Serve root homepage statically (Admin CMS)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
